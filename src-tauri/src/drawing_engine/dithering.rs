use super::{DrawingConfig, DrawingPoint, DrawingEngine};
use image::GenericImageView;

pub struct FloydSteinbergEngine;

impl DrawingEngine for FloydSteinbergEngine {
    fn process_image(&self, image_data: Vec<u8>, config: &DrawingConfig) -> Vec<DrawingPoint> {
        let img = image::load_from_memory(&image_data)
            .expect("Failed to load image");
        
        let gray_img = img.grayscale();
        let (width, height) = gray_img.dimensions();
        
        // Create error diffusion buffer
        let mut pixels: Vec<Vec<f32>> = (0..height)
            .map(|_| (0..width).map(|_| 0.0).collect())
            .collect();
        
        // Convert to grayscale values
        for y in 0..height {
            for x in 0..width {
                let pixel = gray_img.get_pixel(x, y);
                pixels[y as usize][x as usize] = pixel[0] as f32;
            }
        }
        
        let mut points = Vec::new();
        let threshold = 127.0;
        
        // Floyd-Steinberg dithering
        for y in 0..height {
            for x in 0..width {
                let old_pixel = pixels[y as usize][x as usize];
                let new_pixel = if old_pixel > threshold { 255.0 } else { 0.0 };
                let error = old_pixel - new_pixel;
                
                pixels[y as usize][x as usize] = new_pixel;
                
                // Distribute error
                if x + 1 < width {
                    pixels[y as usize][(x + 1) as usize] += error * 7.0 / 16.0;
                }
                if y + 1 < height {
                    if x > 0 {
                        pixels[(y + 1) as usize][(x - 1) as usize] += error * 3.0 / 16.0;
                    }
                    pixels[(y + 1) as usize][x as usize] += error * 5.0 / 16.0;
                    if x + 1 < width {
                        pixels[(y + 1) as usize][(x + 1) as usize] += error * 1.0 / 16.0;
                    }
                }
                
                // Add point if pixel should be drawn
                if new_pixel < threshold {
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
