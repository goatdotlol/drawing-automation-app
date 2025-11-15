use super::{DrawingConfig, DrawingPoint, DrawingEngine};
use image::GenericImageView;

pub struct SpiralRasterEngine;

impl DrawingEngine for SpiralRasterEngine {
    fn process_image(&self, image_data: Vec<u8>, config: &DrawingConfig) -> Vec<DrawingPoint> {
        let img = image::load_from_memory(&image_data)
            .expect("Failed to load image");
        
        let (width, height) = img.dimensions();
        let center_x = width / 2;
        let center_y = height / 2;
        let max_radius = (width.max(height) as f32 * 0.71) as u32; // Diagonal
        
        let mut points = Vec::new();
        let mut angle: f32 = 0.0;
        let mut radius: f32 = 0.0;
        let angle_step: f32 = 0.1;
        let radius_step: f32 = 0.5;
        
        while radius < max_radius as f32 {
            let x = (center_x as f32 + radius * angle.cos()) as u32;
            let y = (center_y as f32 + radius * angle.sin()) as u32;
            
            if x < width && y < height {
                let pixel = img.get_pixel(x, y);
                let r = pixel[0] as u32;
                let g = pixel[1] as u32;
                let b = pixel[2] as u32;
                let brightness = (r * 299 + g * 587 + b * 114) / 1000;
                
                let canvas_x = config.canvas_bounds.x + (x as i32 * config.canvas_bounds.width as i32 / width as i32);
                let canvas_y = config.canvas_bounds.y + (y as i32 * config.canvas_bounds.height as i32 / height as i32);
                
                let color_value = brightness as u8;
                let color = format!("#{:02x}{:02x}{:02x}", color_value, color_value, color_value);
                
                points.push(DrawingPoint {
                    x: canvas_x,
                    y: canvas_y,
                    color,
                    size: (255 - color_value).max(1),
                });
            }
            
            angle += angle_step;
            if angle >= 2.0 * std::f32::consts::PI {
                angle = 0.0;
                radius += radius_step;
            }
        }
        
        points
    }
}
