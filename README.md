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
- cd ../wfs-tfadd-s3-state-cleanup
    terraform init -backend-config=dev.s3.tfbackend
    terraform apply
- cd ../wfs-s3-module
    terraform destroy -var-file=dev.tfvars
- aws s3 rm s3://faccmi01-tf-state-test-156305373065-eu-west-1/tf-test --recursive

Extras:
- wfs-lambda-EmailDatSource (this is actually changing resources in DEV, so be carefull when using it!!!)
- wfs-networking (example on how to logically separated the networking piece from the EC2)
- wfs-ec2 (example on how to separated the EC2 piece from the networking)

Extra clean up actions:
- cd ../wfs-networking-cleanup
    terraform state rm aws_security_group.imported
    terraform state rm aws_subnet.imported
    terraform state rm aws_vpc.imported
    terraform destroy
- cd ../wfs-ecs
    terraform destroy