use super::{DrawingConfig, DrawingPoint, DrawingEngine};
use image::GenericImageView;

pub struct MatrixDotEngine;

impl DrawingEngine for MatrixDotEngine {
    fn process_image(&self, image_data: Vec<u8>, config: &DrawingConfig) -> Vec<DrawingPoint> {
        let img = image::load_from_memory(&image_data)
            .expect("Failed to load image");
        
        let (width, height) = img.dimensions();
        let cell_size = 5u32; // Configurable: 2-10px
        let mut points = Vec::new();

        // Process image into grid cells
        for y in (0..height).step_by(cell_size as usize) {
            for x in (0..width).step_by(cell_size as usize) {
                // Calculate average brightness of cell
                let mut total_brightness = 0u32;
                let mut pixel_count = 0u32;

                for cy in y..(y + cell_size).min(height) {
                    for cx in x..(x + cell_size).min(width) {
                        let pixel = img.get_pixel(cx, cy);
                        let r = pixel[0] as u32;
                        let g = pixel[1] as u32;
                        let b = pixel[2] as u32;
                        // Calculate brightness (luminance)
                        let brightness = (r * 299 + g * 587 + b * 114) / 1000;
                        total_brightness += brightness;
                        pixel_count += 1;
                    }
                }

                let avg_brightness = (total_brightness / pixel_count) as u8;
                // Invert: darker = larger dot
                let dot_size = 255u8.saturating_sub(avg_brightness);
                
                // Map to canvas coordinates
                let canvas_x = config.canvas_bounds.x + (x as i32 * config.canvas_bounds.width as i32 / width as i32);
                let canvas_y = config.canvas_bounds.y + (y as i32 * config.canvas_bounds.height as i32 / height as i32);

                // Get color (simplified - use grayscale for now)
                let color_value = avg_brightness;
                let color = format!("#{:02x}{:02x}{:02x}", color_value, color_value, color_value);

                points.push(DrawingPoint {
                    x: canvas_x,
                    y: canvas_y,
                    color,
                    size: dot_size,
                });
            }
        }

        points
    }
}

