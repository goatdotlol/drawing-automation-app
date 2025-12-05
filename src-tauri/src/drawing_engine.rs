use std::sync::{Arc, Mutex};
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
    pub speed: u64, // Delay in microseconds between actions
    pub method: String,
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
}

pub struct DrawingEngine {
    status: Arc<Mutex<DrawingStatus>>,
    config: Arc<Mutex<DrawingConfig>>,
}

impl DrawingEngine {
    pub fn new() -> Self {
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
        }
    }

    pub fn start(&self, image_path: String, config: DrawingConfig) {
        let status = self.status.clone();
        let _config = self.config.clone();
        
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

            // 5 second delay to let user switch windows
            println!("Starting in 5 seconds...");
            thread::sleep(Duration::from_secs(5));

            for y in 0..height {
                for x in 0..width {
                    // Check status
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
                        thread::sleep(Duration::from_micros(config.speed));
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

    if method == "dithering" {
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
    } else {
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

    result
}
