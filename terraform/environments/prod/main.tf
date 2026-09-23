terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Production S3 Remote State Backend with DynamoDB State Locking
  # backend "s3" {
  #   bucket         = "cloudnative-prod-terraform-state"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-state-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "prod"
      ManagedBy   = "Terraform"
    }
  }
}

# 1. Multi-AZ Production VPC Module
module "vpc" {
  source = "../../modules/vpc"

  project_name        = var.project_name
  environment         = "prod"
  vpc_cidr            = var.vpc_cidr
  availability_zones  = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

# 2. Production Security Groups Module
module "security" {
  source = "../../modules/security"

  project_name = var.project_name
  environment  = "prod"
  vpc_id       = module.vpc.vpc_id
}

# 3. Production EKS Cluster Module
module "eks" {
  source = "../../modules/eks"

  cluster_name              = "${var.project_name}-prod-eks"
  environment               = "prod"
  vpc_id                    = module.vpc.vpc_id
  private_subnet_ids        = module.vpc.private_subnet_ids
  cluster_security_group_id = module.security.cluster_security_group_id
  node_security_group_id    = module.security.node_security_group_id
  instance_types            = ["t3.large"]
  desired_size              = 3
  min_size                  = 2
  max_size                  = 6
}
