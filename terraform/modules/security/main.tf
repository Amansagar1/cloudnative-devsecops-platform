# ==========================================
# EKS Cluster Control Plane Security Group
# ==========================================
resource "aws_security_group" "eks_cluster" {
  name        = "${var.project_name}-${var.environment}-eks-cluster-sg"
  description = "Security group for EKS control plane communication with worker nodes"
  vpc_id      = var.vpc_id

  # Allow inbound HTTPS traffic on port 443 from worker nodes
  ingress {
    description = "Allow inbound traffic from control plane"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-eks-cluster-sg"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# ==========================================
# EKS Worker Nodes Security Group
# ==========================================
resource "aws_security_group" "eks_nodes" {
  name        = "${var.project_name}-${var.environment}-eks-nodes-sg"
  description = "Security group for EKS worker nodes allowing pod-to-pod and cluster communication"
  vpc_id      = var.vpc_id

  # Allow nodes to communicate with each other freely across all ports
  ingress {
    description = "Allow inter-node pod communication"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }

  # Allow worker nodes to receive communication from control plane
  ingress {
    description     = "Allow worker nodes to accept traffic from EKS control plane"
    from_port       = 1025
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster.id]
  }

  # Allow control plane to communicate on port 443 for webhooks
  ingress {
    description     = "Allow control plane to reach pods on port 443"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_cluster.id]
  }

  # Outbound internet access to pull images and reach external APIs
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name                                           = "${var.project_name}-${var.environment}-eks-nodes-sg"
    Environment                                    = var.environment
    "kubernetes.io/cluster/${var.project_name}-eks" = "owned"
    ManagedBy                                      = "Terraform"
  }
}
