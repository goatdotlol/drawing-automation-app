use std::sync::{Arc, Mutex, atomic::{AtomicBool, Ordering}};
use std::thread;
use std::time::Duration;
use image::GenericImageView;
use enigo::{Enigo, Settings, Mouse, Button, Direction, Coordinate};

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum DrawingStatus {
    Idle,
    Running,
    Paused,
    Stopped,
}

#[derive(Clone, Debug)]
pub struct DrawingConfig {
    pub speed: u64, // Delay in milliseconds between actions (1-50ms)
    pub method: String,
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
}

pub struct DrawingEngine {
    status: Arc<Mutex<DrawingStatus>>,
    config: Arc<Mutex<DrawingConfig>>,
    stop_flag: Arc<AtomicBool>, // F8 Emergency stop flag
}

impl DrawingEngine {
    pub fn new(stop_flag: Arc<AtomicBool>) -> Self {
        Self {
            status: Arc::new(Mutex::new(DrawingStatus::Idle)),
            config: Arc::new(Mutex::new(DrawingConfig {
                speed: 1000,
                method: "matrix".to_string(),
                width: 100,
                height: 100,
                x: 0,
                y: 0,
            })),
            stop_flag,
        }
    }

    pub fn start(&self, image_path: String, config: DrawingConfig) {
        let status = self.status.clone();
        let _config = self.config.clone();
        let stop_flag = self.stop_flag.clone();
        
        // Reset stop flag
        stop_flag.store(false, Ordering::Relaxed);
        
        // Update config
        {
            let mut c = _config.lock().unwrap();
            *c = config.clone();
        }

        // Set status to running
        {
            let mut s = status.lock().unwrap();
            *s = DrawingStatus::Running;
        }

        thread::spawn(move || {
            // Initialize Enigo with default settings
            let mut enigo = match Enigo::new(&Settings::default()) {
                Ok(e) => e,
                Err(e) => {
                    println!("Failed to initialize Enigo: {:?}", e);
                    let mut s = status.lock().unwrap();
                    *s = DrawingStatus::Idle;
                    return;
                }
            };
            
            // Load image
            let img = match image::open(&image_path) {
                Ok(i) => i,
                Err(e) => {
                    println!("Failed to open image: {}", e);
                    let mut s = status.lock().unwrap();
                    *s = DrawingStatus::Idle;
                    return;
                }
            };

            // Resize image
            let img = img.resize(config.width, config.height, image::imageops::FilterType::Lanczos3);
            let (width, height) = img.dimensions();

            // Process image based on method
            let pixels_to_draw = process_image(&img, &config.method);

            println!("Starting drawing: {}x{} at ({}, {}) using {}", width, height, config.x, config.y, config.method);

            //  3 second delay to let user switch windows
            println!("Starting in 3 seconds...");
            thread::sleep(Duration::from_secs(3));

            // Main drawing loop
            for y in 0..height {
                for x in 0..width {
                    // CHECK F8 EMERGENCY STOP (highest priority)
                    if stop_flag.load(Ordering::Relaxed) {
                        println!("🚨 EMERGENCY STOP TRIGGERED!");
                        let mut s = status.lock().unwrap();
                        *s = DrawingStatus::Stopped;
                        return;
                    }

                    // Check regular status (pause/stop)
                    {
                        let mut s = status.lock().unwrap();
                        if *s == DrawingStatus::Stopped {
                            println!("Drawing stopped");
                            *s = DrawingStatus::Idle;
                            return;
                        }
                        // Handle pause
                        while *s == DrawingStatus::Paused {
                            thread::sleep(Duration::from_millis(100));
                        }
                    }

                    if pixels_to_draw[y as usize][x as usize] {
                        // Move mouse to absolute coordinates
                        let _ = enigo.move_mouse(config.x + x as i32, config.y + y as i32, Coordinate::Abs);
                        // Click left button
                        let _ = enigo.button(Button::Left, Direction::Click);
                        
                        // CRITICAL: Always have minimum 1ms delay to prevent system freeze
                        // Speed is in milliseconds: 0ms (fastest with 1ms min) to 50ms (slowest)
                        let delay_ms = if config.speed == 0 { 1 } else { config.speed };
                        thread::sleep(Duration::from_millis(delay_ms));
                    }
                }
            }

            println!("Drawing finished");
            let mut s = status.lock().unwrap();
            *s = DrawingStatus::Idle;
        });
    }

    pub fn stop(&self) {
        let mut status = self.status.lock().unwrap();
        *status = DrawingStatus::Stopped;
    }

    pub fn pause(&self) {
        let mut status = self.status.lock().unwrap();
        if *status == DrawingStatus::Running {
            *status = DrawingStatus::Paused;
        } else if *status == DrawingStatus::Paused {
            *status = DrawingStatus::Running;
        }
    }
}

fn process_image(img: &image::DynamicImage, method: &str) -> Vec<Vec<bool>> {
    let (width, height) = img.dimensions();
    let mut result = vec![vec![false; width as usize]; height as usize];

    match method {
        "dithering" => {
            // Floyd-Steinberg Dithering
            let mut gray_img = img.to_luma8();
            let w = width as i32;
            let h = height as i32;

            for y in 0..h {
                for x in 0..w {
                    let old_pixel = gray_img.get_pixel(x as u32, y as u32)[0];
                    let new_pixel = if old_pixel < 128 { 0 } else { 255 };
                    
                    // Mark for drawing if black
                    if new_pixel == 0 {
                        result[y as usize][x as usize] = true;
                    }

                    let quant_error = old_pixel as i16 - new_pixel as i16;

                    // Distribute error
                    let distribute = |img: &mut image::GrayImage, x: i32, y: i32, factor: f32| {
                        if x >= 0 && x < w && y >= 0 && y < h {
                            let p = img.get_pixel(x as u32, y as u32)[0] as i16;
                            let new_val = (p as f32 + quant_error as f32 * factor).clamp(0.0, 255.0) as u8;
                            img.put_pixel(x as u32, y as u32, image::Luma([new_val]));
                        }
                    };

                    distribute(&mut gray_img, x + 1, y, 7.0 / 16.0);
                    distribute(&mut gray_img, x - 1, y + 1, 3.0 / 16.0);
                    distribute(&mut gray_img, x, y + 1, 5.0 / 16.0);
                    distribute(&mut gray_img, x + 1, y + 1, 1.0 / 16.0);
                }
            }
        },
        "spiral" => {
            // TRUE SPIRAL: Start from center, spiral outward using polar coordinates
            let gray = img.to_luma8();
            let cx = width as f32 / 2.0;
            let cy = height as f32 / 2.0;
            let max_radius = ((cx * cx + cy * cy).sqrt()) as i32;
            
            let mut theta: f32 = 0.0;
            let mut radius: f32 = 0.0;
            let theta_step = 0.1; // Angular step
            let radius_step = 0.05; // Radial growth rate
            
            while radius < max_radius as f32 {
                let x = (cx + radius * theta.cos()).round() as i32;
                let y = (cy + radius * theta.sin()).round() as i32;
                
                if x >= 0 && x < width as i32 && y >= 0 && y < height as i32 {
                    let pixel = gray.get_pixel(x as u32, y as u32)[0];
                    if pixel < 128 {
                        result[y as usize][x as usize] = true;
                    }
                }
                
                theta += theta_step;
                radius += radius_step;
            }
        },
        "stippling" => {
            // VARIABLE DENSITY STIPPLING: More dots in dark areas
            let gray = img.to_luma8();
            
            for y in (0..height).step_by(3) {
                for x in (0..width).step_by(3) {
                    let pixel = gray.get_pixel(x, y)[0];
                    let darkness = 1.0 - (pixel as f32 / 255.0);
                    
                    // Place dots with probability based on darkness
                    // Use deterministic pseudo-random based on position
                    let hash = ((x * 73856093) ^ (y * 19349663)) as f32;
                    let prob = (hash.sin() + 1.0) / 2.0;
                    
                    if prob < darkness {
                        result[y as usize][x as usize] = true;
                    }
                }
            }
        },
        "contour" => {
            // EDGE TRACING: Detect edges and follow them
            use imageproc::edges::canny;
            let gray = img.to_luma8();
            let edges = canny(&gray, 50.0, 100.0);
            
            // Mark edge pixels for drawing
            for y in 0..height {
                for x in 0..width {
                    if edges.get_pixel(x, y)[0] > 128 {
                        result[y as usize][x as usize] = true;
                    }
                }
            }
        },
        "human" => {
            // HUMAN/OUTLINE MODE: Canny edges + nearest-neighbor sorting
            use imageproc::edges::canny;
            let gray = img.to_luma8();
            let edges = canny(&gray, 50.0, 100.0);
            
            // Extract edge pixels
            let mut edge_pixels: Vec<(usize, usize)> = Vec::new();
            for y in 0..height {
                for x in 0..width {
                    if edges.get_pixel(x, y)[0] > 128 {
                        edge_pixels.push((x as usize, y as usize));
                    }
                }
            }
            
            // Sort using nearest-neighbor (greedy TSP approximation)
            if !edge_pixels.is_empty() {
                let mut sorted_pixels = Vec::new();
                let mut current = edge_pixels[0];
                sorted_pixels.push(current);
                edge_pixels.remove(0);
                
                while !edge_pixels.is_empty() && sorted_pixels.len() < 10000 {
                    // Find nearest unvisited pixel (limit search for performance)
                    let search_limit = edge_pixels.len().min(500);
                    let mut nearest_idx = 0;
                    let mut min_dist = f32::MAX;
                    
                    for i in 0..search_limit {
                        let (x, y) = edge_pixels[i];
                        let dx = x as f32 - current.0 as f32;
                        let dy = y as f32 - current.1 as f32;
                        let dist = dx * dx + dy * dy;
                        
                        if dist < min_dist {
                            min_dist = dist;
                            nearest_idx = i;
                        }
                    }
                    
                    current = edge_pixels[nearest_idx];
                    sorted_pixels.push(current);
                    edge_pixels.remove(nearest_idx);
                }
                
                // Mark sorted pixels for drawing
                for (x, y) in sorted_pixels {
                    result[y][x] = true;
                }
            }
        },
        "continuous" => {
            // CONTINUOUS LINE: Hilbert curve for single continuous path
            // For now, use simple serpentine (will implement Hilbert later)
            let gray = img.to_luma8();
            for y in 0..height {
                let row_iter: Box<dyn Iterator<Item = u32>> = if y % 2 == 0 {
                    Box::new(0..width)
                } else {
                    Box::new((0..width).rev())
                };
                
                for x in row_iter {
                    let pixel = gray.get_pixel(x, y)[0];
                    if pixel < 128 {
                        result[y as usize][x as usize] = true;
                    }
                }
            }
        },
        _ => {
            // Default: Matrix / Threshold
            for y in 0..height {
                for x in 0..width {
                    let pixel = img.get_pixel(x, y);
                    let brightness = 0.2126 * pixel[0] as f32 + 0.7152 * pixel[1] as f32 + 0.0722 * pixel[2] as f32;
                    if brightness < 128.0 {
                        result[y as usize][x as usize] = true;
                    }
                }
            }
        }
    }

    result
}
