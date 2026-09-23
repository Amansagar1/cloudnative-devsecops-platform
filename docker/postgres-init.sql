-- Initialize Database Schema for DevSecOps Demo Application
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Records
INSERT INTO items (title, status) VALUES 
('Setup Infrastructure with Terraform', 'Completed'),
('Containerize Microservices with Multi-Stage Docker', 'Completed'),
('Build DevSecOps CI Pipeline with Trivy', 'In Progress'),
('Deploy Kubernetes Cluster with Helm & ArgoCD', 'Pending')
ON CONFLICT DO NOTHING;
