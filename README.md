# 🚀 Enterprise Cloud-Native DevSecOps & GitOps Platform

[![CI Pipeline](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=github-actions&logoColor=white)](https://github.com)
[![Docker](https://img.shields.io/badge/Containers-Docker_Multi--Stage-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io)
[![Helm](https://img.shields.io/badge/Packaging-Helm_v3-0F1689?logo=helm&logoColor=white)](https://helm.sh)
[![GitOps](https://img.shields.io/badge/CD-ArgoCD-EF7B4D?logo=argo&logoColor=white)](https://argo-cd.readthedocs.io)
[![IaC](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform&logoColor=white)](https://terraform.io)
[![Observability](https://img.shields.io/badge/Monitoring-Prometheus_%26_Grafana-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io)

---

## 📌 Project Overview
This repository contains a production-ready, cloud-native microservices platform built from the ground up demonstrating modern **DevOps, DevSecOps, GitOps, and Infrastructure-as-Code (IaC)** best practices.

Designed to reflect enterprise environments, this project showcases:
- **Zero-Downtime GitOps Deployments** with ArgoCD.
- **Automated DevSecOps Pipeline** with SAST, vulnerability scanning (Trivy), and container signing.
- **Modular Infrastructure-as-Code** with Terraform on AWS (VPC, Subnets, EKS, IAM, Security Groups).
- **Production Kubernetes Configurations** (Ingress Nginx, HPA, ConfigMaps, Secrets, Resource Quotas, Helm).
- **Full-Stack Observability** with Prometheus metrics scraping, custom Grafana dashboards, and proactive alerting.

---

## 📂 Repository Structure

```text
d:/DevOps/
├── .github/
│   └── workflows/                # DevSecOps CI/CD Pipelines (Lint, Test, Trivy Scan, Build, Push)
├── app/
│   ├── backend/                  # REST API Microservice (Node.js/Express + Redis + PostgreSQL)
│   │   ├── src/                  # Application source code
│   │   ├── tests/                # Unit and integration tests
│   │   └── Dockerfile            # Multi-stage optimized Docker build
│   └── frontend/                 # Client UI (React / Modern Web Interface)
│       ├── public/
│       ├── src/
│       └── Dockerfile            # Lightweight Nginx-based production image
├── docker/
│   ├── docker-compose.yml        # Local development orchestration (App + Redis + Postgres)
│   └── nginx/                    # Reverse proxy & custom SSL/routing configs
├── k8s/
│   ├── base/                     # Raw K8s manifests (Deployments, Services, ConfigMaps, Secrets, HPA)
│   ├── overlays/                 # Kustomize environment overlays (dev, prod)
│   └── helm/
│       └── cloudnative-app/      # Production Helm 3 chart for parameterized releases
├── gitops/
│   └── argocd/                   # ArgoCD Application & App-of-Apps manifests for GitOps sync
├── terraform/
│   ├── environments/             # Environment-specific root modules (dev, prod)
│   └── modules/                  # Reusable Terraform modules
│       ├── vpc/                  # Multi-AZ VPC, Public/Private subnets, NAT Gateways
│       ├── eks/                  # Managed EKS Cluster, Node Groups, IAM Roles
│       └── security/             # Security Groups, Network ACLs, IAM Policies
├── jenkins/
│   └── Jenkinsfile               # Declarative Jenkins CI/CD pipeline script
├── monitoring/
│   ├── prometheus/               # Prometheus scrape configs & custom alert rules
│   └── grafana/                  # Pre-configured Grafana dashboards & datasources
├── scripts/                      # Automation shell & PowerShell helper scripts
└── docs/                         # Architecture diagrams, interview runbooks & cheat sheets
```

---

## 🛠️ Technology Stack Breakdown

| Category | Tools & Technologies |
| :--- | :--- |
| **Cloud Provider** | Amazon Web Services (AWS) / Local Minikube |
| **Infrastructure as Code** | Terraform (Modules, Remote State, DynamoDB Lock) |
| **Containerization** | Docker (Multi-stage builds, non-root users, distroless/alpine) |
| **Orchestration & Packaging** | Kubernetes (EKS), Kustomize, Helm 3 |
| **CI / Security Scanning** | GitHub Actions, Jenkins, Trivy (CVE scans), ESLint |
| **Continuous Delivery (CD)** | ArgoCD (GitOps automated reconciliation) |
| **Observability & Alerting**| Prometheus, Grafana, Alertmanager |
| **Application Layer** | Node.js (Express), React, Redis (Cache), PostgreSQL (DB), Nginx |
