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

            // Resize image (basic implementation)
            let img = img.resize(config.width, config.height, image::imageops::FilterType::Nearest);
            let (width, height) = img.dimensions();

            println!("Starting drawing: {}x{} at ({}, {})", width, height, config.x, config.y);

            // 5 second delay to let user switch windows
            println!("Starting in 5 seconds...");
            thread::sleep(Duration::from_secs(5));

            for y in 0..height {
                for x in 0..width {
                    // Check status
                    {
                        let s = status.lock().unwrap();
                        if *s == DrawingStatus::Stopped {
                            println!("Drawing stopped");
                            *s = DrawingStatus::Idle;
                            return;
                        }
                        // Handle pause (spin loop for simplicity)
                        while *s == DrawingStatus::Paused {
                            thread::sleep(Duration::from_millis(100));
                        }
                    }

                    let pixel = img.get_pixel(x, y);
                    // Basic threshold for black/white
                    let brightness = 0.2126 * pixel[0] as f32 + 0.7152 * pixel[1] as f32 + 0.0722 * pixel[2] as f32;

                    if brightness < 128.0 {
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
