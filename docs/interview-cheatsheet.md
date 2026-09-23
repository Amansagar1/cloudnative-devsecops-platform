# 🎯 DevOps Interview Cheat Sheet & Architecture Defense Guide
**Candidate:** Kumar Aman Sagar  
**Project:** Cloud-Native DevSecOps Platform with GitOps, Terraform & Observability  
**Repository:** [https://github.com/Amansagar1/cloudnative-devsecops-platform](https://github.com/Amansagar1/cloudnative-devsecops-platform)

---

## ⚡ 1. The 60-Second "Elevator Pitch"
*(Use this when the interviewer says: "Walk me through a project you've built or worked on.")*

> *"I designed and built an end-to-end cloud-native DevSecOps platform hosting a multi-tier microservice architecture with automated GitOps continuous delivery.*
> 
> *The infrastructure is provisioned on **AWS using modular Terraform**, including a multi-AZ VPC, private subnets, security groups, and an **EKS Kubernetes cluster**.*
> 
> *For our CI/CD, every commit triggers a **GitHub Actions DevSecOps pipeline** that runs automated unit tests, npm vulnerability audits, multi-stage Docker builds, and container vulnerability scans using **Trivy** before publishing immutable SHA-tagged images to GitHub Container Registry.*
> 
> *Deployments are managed declaratively using **ArgoCD (GitOps)** with automated drift detection and self-healing. In Kubernetes, services are configured with zero-downtime rolling updates, Liveness and Readiness probes, and Horizontal Pod Autoscaling.*
> 
> *Finally, the entire stack is monitored 24/7 using **Prometheus** for metrics scraping and **Grafana** for visualization, backed by Alertmanager rules for CPU and error rate spikes."*

---

## 🛡️ 2. Top Interview Questions & How to Defend Your Code

### Q1: "Why did you use Multi-Stage Docker builds and non-root users?"
* **Answer:**  
  *"Standard single-stage builds leave compiler tools, development dependencies, and package managers inside the final image, bloating size to over 1GB and exposing a large attack surface. In our `Dockerfile`, Stage 1 builds dependencies, while Stage 2 copies only production artifacts into a minimal `node:20-alpine` image (under 120MB).*  
  *Furthermore, default Docker containers run as `root`. We enforced `USER node` following the principle of least privilege, preventing container escape attacks from taking over the underlying host."*

---

### Q2: "What is the difference between Liveness and Readiness Probes in Kubernetes?"
* **Answer:**  
  *"They serve two completely different lifecycle purposes:*
  - ***Liveness Probe (`/api/live`)***: *Checks if the application container is alive or deadlocked. If it fails consecutive checks, the `kubelet` kills and restarts the pod.*
  - ***Readiness Probe (`/api/ready`)***: *Checks if the application is ready to accept incoming traffic (e.g. database connection pool initialized, Redis reachable). If it fails, Kubernetes does NOT restart the pod; it simply stops sending network traffic to it until it recovers.*"

---

### Q3: "How does GitOps with ArgoCD differ from traditional CI/CD pipelines?"
* **Answer:**  
  *"In traditional push-based CI/CD (like basic Jenkins or GitHub Actions running `kubectl apply`), the CI runner requires cluster admin credentials, which is a major security risk.*  
  *With **GitOps (pull-based)**, the cluster pulls changes from Git. **ArgoCD** runs inside the Kubernetes cluster as a controller. Git is the single source of truth. ArgoCD detects configuration drift — if an engineer manually edits a deployment via `kubectl edit`, ArgoCD automatically detects the drift and self-heals the cluster back to match Git."*

---

### Q4: "How did you structure your Terraform code and manage state?"
* **Answer:**  
  *"We structured Terraform into reusable **Modules** (`vpc`, `security`, `eks`) and environment roots (`dev`, `prod`). This ensures DRY (Don't Repeat Yourself) architecture.*  
  *For production state management, we use an **S3 remote backend with server-side AES256 encryption** and a **DynamoDB table for state locking** (`LockID`). This prevents race conditions and corrupted state files when multiple engineers run `terraform apply` concurrently."*

---

### Q5: "How did you implement security scanning in the pipeline (DevSecOps)?"
* **Answer:**  
  *"We adopted a 'Shift-Left' security model:*
  1. *Dependency Audit: `npm audit --audit-level=high` runs during the test stage.*
  2. *Container Vulnerability Scanning: After building the Docker image, **Trivy** scans the image layers for OS-level and library CVEs with severity `HIGH` or `CRITICAL` before allowing any image push to the registry.*
  3. *Least-Privilege GitHub Actions permissions: The workflow explicitly scopes tokens (`contents: read`, `packages: write`) to prevent secret exposure."*

---

### Q6: "How does Horizontal Pod Autoscaling (HPA) work in your cluster?"
* **Answer:**  
  *"Our HPA monitors the metrics server for pod resource consumption. We configured scaling thresholds at 70% CPU and 80% RAM with min replicas set to 2 and max to 10. To prevent rapid flapping (thrashing) during momentary spikes, we configured stabilization windows with granular scale-down policies."*

---

### 📋 Technology Stack Summary

| Technology | Implementation in this Repository |
| :--- | :--- |
| **AWS Cloud** | Multi-AZ VPC, Public/Private Subnets, NAT Gateway, EKS Cluster |
| **Terraform (IaC)** | Modular architecture with S3 remote state and DynamoDB locking |
| **Docker** | Multi-stage builds, Alpine base, `USER node`, `dumb-init`, Healthchecks |
| **Kubernetes (K8s)** | Deployments, Services, ConfigMaps, Secrets, Ingress, HPA, Kustomize |
| **Helm** | Parameterized Helm 3 package with `Chart.yaml` and `values.yaml` |
| **GitHub Actions** | DevSecOps CI with unit tests, Trivy CVE scanning, GHCR publishing |
| **Jenkins** | Declarative multi-stage `Jenkinsfile` with build and deployment stages |
| **GitOps** | ArgoCD Application CRDs with automated sync and self-healing |
| **Monitoring** | Prometheus scraping configs, Alertmanager rules, Grafana datasources |
