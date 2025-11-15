use image::{DynamicImage, GenericImageView};

pub fn resize_image(img: DynamicImage, max_width: u32, max_height: u32) -> DynamicImage {
    let (width, height) = img.dimensions();
    
    if width <= max_width && height <= max_height {
        return img;
    }

    let ratio = (max_width as f32 / width as f32).min(max_height as f32 / height as f32);
    let new_width = (width as f32 * ratio) as u32;
    let new_height = (height as f32 * ratio) as u32;

    img.resize_exact(new_width, new_height, image::imageops::FilterType::Lanczos3)
}

pub fn convert_to_grayscale(img: DynamicImage) -> DynamicImage {
    img.grayscale()
}

