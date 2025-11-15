use crate::drawing_engine::DrawingPoint;

pub fn optimize_path(points: Vec<DrawingPoint>) -> Vec<DrawingPoint> {
    if points.is_empty() {
        return points;
    }

    // Nearest-neighbor path optimization
    let mut optimized = Vec::new();
    let mut remaining: Vec<(usize, DrawingPoint)> = points.into_iter().enumerate().collect();
    
    // Start with first point
    let (_first_idx, first_point) = remaining.remove(0);
    optimized.push(first_point);

    while !remaining.is_empty() {
        let current = &optimized[optimized.len() - 1];
        let mut best_idx = 0;
        let mut best_distance = f64::MAX;

        // Find nearest point
        for (idx, point) in remaining.iter().enumerate() {
            let dx = (point.1.x - current.x) as f64;
            let dy = (point.1.y - current.y) as f64;
            let distance = (dx * dx + dy * dy).sqrt();

            if distance < best_distance {
                best_distance = distance;
                best_idx = idx;
            }
        }

        let (_, next_point) = remaining.remove(best_idx);
        optimized.push(next_point);
    }

    optimized
}

