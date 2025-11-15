use image::GenericImageView;
use super::{DrawingConfig, DrawingPoint, DrawingEngine};

pub struct ScanlineEngine;

impl DrawingEngine for ScanlineEngine {
    fn process_image(&self, image_data: Vec<u8>, config: &DrawingConfig) -> Vec<DrawingPoint> {
        let img = image::load_from_memory(&image_data)
            .expect("Failed to load image");
        
        let (width, height) = img.dimensions();
        let mut points = Vec::new();

        // Scan each horizontal line
        for y in 0..height {
            let mut current_color: Option<(u8, u8, u8)> = None;
            let mut start_x = 0u32;

            for x in 0..width {
                let pixel = img.get_pixel(x, y);
                let r = pixel[0];
                let g = pixel[1];
                let b = pixel[2];
                let color = (r, g, b);

                match current_color {
                    None => {
                        current_color = Some(color);
                        start_x = x;
                    }
                    Some(c) if c != color => {
                        // Color changed, draw line segment
                        if start_x < x {
                            let canvas_x = config.canvas_bounds.x + (start_x as i32 * config.canvas_bounds.width as i32 / width as i32);
                            let canvas_y = config.canvas_bounds.y + (y as i32 * config.canvas_bounds.height as i32 / height as i32);
                            let canvas_end_x = config.canvas_bounds.x + ((x - 1) as i32 * config.canvas_bounds.width as i32 / width as i32);
                            
                            // Add points for line segment
                            for line_x in canvas_x..=canvas_end_x {
                                points.push(DrawingPoint {
                                    x: line_x,
                                    y: canvas_y,
                                    color: format!("#{:02x}{:02x}{:02x}", c.0, c.1, c.2),
                                    size: 255,
                                });
                            }
                        }
                        current_color = Some(color);
                        start_x = x;
                    }
                    _ => {}
                }
            }

            // Draw remaining line segment
            if let Some(c) = current_color {
                if start_x < width {
                    let canvas_x = config.canvas_bounds.x + (start_x as i32 * config.canvas_bounds.width as i32 / width as i32);
                    let canvas_y = config.canvas_bounds.y + (y as i32 * config.canvas_bounds.height as i32 / height as i32);
                    let canvas_end_x = config.canvas_bounds.x + ((width - 1) as i32 * config.canvas_bounds.width as i32 / width as i32);
                    
                    for line_x in canvas_x..=canvas_end_x {
                        points.push(DrawingPoint {
                            x: line_x,
                            y: canvas_y,
                            color: format!("#{:02x}{:02x}{:02x}", c.0, c.1, c.2),
                            size: 255,
                        });
                    }
                }
            }
        }

        points
    }
}
