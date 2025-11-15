use image::GenericImageView;
use super::{DrawingConfig, DrawingPoint, DrawingEngine};
use rand::Rng;

pub struct StipplingEngine;

impl DrawingEngine for StipplingEngine {
    fn process_image(&self, image_data: Vec<u8>, config: &DrawingConfig) -> Vec<DrawingPoint> {
        let img = image::load_from_memory(&image_data)
            .expect("Failed to load image");
        
        let gray_img = img.grayscale();
        let (width, height) = gray_img.dimensions();
        let mut points = Vec::new();
        let mut rng = rand::thread_rng();

        // Analyze brightness and place dots with varying density
        let cell_size = 10u32;
        for y in (0..height).step_by(cell_size as usize) {
            for x in (0..width).step_by(cell_size as usize) {
                // Calculate average brightness of cell
                let mut total_brightness = 0u32;
                let mut pixel_count = 0u32;

                for cy in y..(y + cell_size).min(height) {
                    for cx in x..(x + cell_size).min(width) {
                        let pixel = gray_img.get_pixel(cx, cy);
                        total_brightness += pixel[0] as u32;
                        pixel_count += 1;
                    }
                }

                let avg_brightness = (total_brightness / pixel_count) as u8;
                // Darker areas = more dots
                let dot_probability = (255 - avg_brightness) as f32 / 255.0;
                
                // Place dots based on probability
                let num_dots = (dot_probability * 5.0) as u32; // 0-5 dots per cell
                
                for _ in 0..num_dots {
                    let offset_x = rng.gen_range(0..cell_size.min(width - x));
                    let offset_y = rng.gen_range(0..cell_size.min(height - y));
                    
                    let canvas_x = config.canvas_bounds.x + ((x + offset_x) as i32 * config.canvas_bounds.width as i32 / width as i32);
                    let canvas_y = config.canvas_bounds.y + ((y + offset_y) as i32 * config.canvas_bounds.height as i32 / height as i32);
                    
                    let color_value = avg_brightness;
                    let color = format!("#{:02x}{:02x}{:02x}", color_value, color_value, color_value);
                    
                    points.push(DrawingPoint {
                        x: canvas_x,
                        y: canvas_y,
                        color,
                        size: (255 - color_value).max(1),
                    });
                }
            }
        }

        points
    }
}
