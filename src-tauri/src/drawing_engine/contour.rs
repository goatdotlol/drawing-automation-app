use image::GenericImageView;
use super::{DrawingConfig, DrawingPoint, DrawingEngine};

pub struct ContourVectorEngine;

impl DrawingEngine for ContourVectorEngine {
    fn process_image(&self, image_data: Vec<u8>, config: &DrawingConfig) -> Vec<DrawingPoint> {
        let img = image::load_from_memory(&image_data)
            .expect("Failed to load image");
        
        let gray_img = img.grayscale();
        let (width, height) = gray_img.dimensions();
        let mut points = Vec::new();

        // Simple edge detection using Sobel operator
        let threshold = 100u8;
        
        for y in 1..(height - 1) {
            for x in 1..(width - 1) {
                // Sobel X
                let gx = gray_img.get_pixel(x - 1, y - 1)[0] as i16 * -1
                    + gray_img.get_pixel(x - 1, y)[0] as i16 * -2
                    + gray_img.get_pixel(x - 1, y + 1)[0] as i16 * -1
                    + gray_img.get_pixel(x + 1, y - 1)[0] as i16 * 1
                    + gray_img.get_pixel(x + 1, y)[0] as i16 * 2
                    + gray_img.get_pixel(x + 1, y + 1)[0] as i16 * 1;

                // Sobel Y
                let gy = gray_img.get_pixel(x - 1, y - 1)[0] as i16 * -1
                    + gray_img.get_pixel(x, y - 1)[0] as i16 * -2
                    + gray_img.get_pixel(x + 1, y - 1)[0] as i16 * -1
                    + gray_img.get_pixel(x - 1, y + 1)[0] as i16 * 1
                    + gray_img.get_pixel(x, y + 1)[0] as i16 * 2
                    + gray_img.get_pixel(x + 1, y + 1)[0] as i16 * 1;

                let magnitude = ((gx * gx + gy * gy) as f32).sqrt() as u8;

                if magnitude > threshold {
                    let canvas_x = config.canvas_bounds.x + (x as i32 * config.canvas_bounds.width as i32 / width as i32);
                    let canvas_y = config.canvas_bounds.y + (y as i32 * config.canvas_bounds.height as i32 / height as i32);
                    
                    points.push(DrawingPoint {
                        x: canvas_x,
                        y: canvas_y,
                        color: "#000000".to_string(),
                        size: 255,
                    });
                }
            }
        }

        points
    }
}
