variable "cluster_name" {
  description = "Name of the EKS Cluster"
  type        = string
  default     = "cloudnative-eks"
}

variable "cluster_version" {
  description = "Kubernetes version for EKS"
  type        = string
  default     = "1.30"
}

variable "vpc_id" {
  description = "VPC ID where the cluster will be deployed"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs where worker nodes and cluster ENIs reside"
  type        = list(string)
}

variable "cluster_security_group_id" {
  description = "Security Group ID for EKS control plane"
  type        = string
}

variable "node_security_group_id" {
  description = "Security Group ID for EKS worker nodes"
  type        = string
}

variable "instance_types" {
  description = "EC2 instance types for the EKS node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "desired_size" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 2
}

variable "min_size" {
  description = "Minimum number of worker nodes for auto-scaling"
  type        = number
  default     = 1
}

variable "max_size" {
  description = "Maximum number of worker nodes for auto-scaling"
  type        = number
  default     = 4
}

variable "environment" {
  description = "Environment identifier"
  type        = string
  default     = "dev"
}
