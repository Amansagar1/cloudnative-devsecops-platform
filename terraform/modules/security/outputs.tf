output "cluster_security_group_id" {
  description = "Security Group ID for EKS Cluster Control Plane"
  value       = aws_security_group.eks_cluster.id
}

output "node_security_group_id" {
  description = "Security Group ID for EKS Worker Nodes"
  value       = aws_security_group.eks_nodes.id
}
