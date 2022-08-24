# tf-test
Terraform test repository

In order:
- workshop-from-seb (the original from the first session)
- wfs-vars (removing hard-coded values in favour of variables)
- wfs-imports (step one in importing existing resources)
- wfs-tfadd (3rd party add-on use for the second step in importing existing resources)
- workshop-from-seb (showcase of resource marked as to be deleted and "-target" switch)
- workshop-from-seb-private-state (introduction to backend configurations for state files)
- wfs-vars-s3-state (s3 backend configuration example > main state)
- wfs-tfadd-s3-state (s3 backend configuration for imported resources only > imported resources own state)
- wfs-ssm-s3-state (instance with imported SSM > main state again)
- wfs-s3-module (example in using modules to create S3 buckets from GitHub)

Import commands, for reference:

terraform import aws_security_group.imported-sg-demo sg-090bf4911c5fba733
terraform import aws_subnet.imported-subnet-demo subnet-6ed2eb35

Clean up actions:
- cd ../workshop-from-seb
    terraform state rm aws_subnet.imported-subnet-demo
    terraform state rm aws_security_group.imported-sg-demo
    terraform destroy
- cd ../wfs-vars-s3-state
    terraform destroy -var-file=dev.tfvars
- cd ../wfs-s3-module
    terraform destroy -var-file=dev.tfvars
