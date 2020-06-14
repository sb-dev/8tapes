# AWS Resources

**CloudFormation**:
* amplify-8tapesapi-dev-184346 *AWS::CloudFormation::Stack Fri Jun 12 2020 18:44:16 GMT+0100 (British Summer Time)*

**IAM**:  
* UnauthRole AWS::IAM::Role *AWS::IAM::Role Fri Jun 12 2020 18:44:10 GMT+0100 (British Summer Time)*
* AuthRole AWS::IAM::Role *AWS::IAM::Role Fri Jun 12 2020 18:44:09 GMT+0100 (British Summer Time)*
* UpdateRolesWithIDPFunctionRole *AWS::IAM::Role Sat Jun 13 2020 08:08:16 GMT+0100 (British Summer Time)*
* SNSRole *AWS::IAM::Role Sat Jun 13 2020 08:08:22 GMT+0100 (British Summer Time)*
* UserPoolClientRole *AWS::IAM::Role Sat Jun 13 2020 08:08:49 GMT+0100 (British Summer Time)*
* UserPoolClientLambdaPolicy *AWS::IAM::Policy Sat Jun 13 2020 08:09:11 GMT+0100 (British Summer Time)*
* UserPoolClientLogPolicy *AWS::IAM::Policy Sat Jun 13 2020 08:09:29 GMT+0100 (British Summer Time)*
* userGroupRole *AWS::IAM::Role Sat Jun 13 2020 08:45:26 GMT+0100 (British Summer Time)*
* curatorGroupRole *AWS::IAM::Role Sat Jun 13 2020 08:45:26 GMT+0100 (British Summer Time)*
* premiumGroupRole *AWS::IAM::Role Sat Jun 13 2020 08:45:25 GMT+0100 (British Summer Time)*
* adminGroupRole *AWS::IAM::Role Sat Jun 13 2020 08:45:25 GMT+0100 (British Summer Time)*
* LambdaExecutionRole *AWS::IAM::Role Sat Jun 13 2020 08:45:29 GMT+0100 (British Summer Time)*
* LambdaExecutionRole *AWS::IAM::Role Sun Jun 14 2020 08:39:08 GMT+0100 (British Summer Time)*
* 8tapesapi81fc17f6PostConfirmationAddToGroupCognito *AWS::IAM::Policy Sun Jun 14 2020 08:40:05 GMT+0100 (British Summer Time)*

**S3**:
* DeploymentBucket *AWS::S3::Bucket Fri Jun 12 2020 18:44:15 GMT+0100 (British Summer Time)*

**Cognito**:
* UserPool *AWS::Cognito::UserPool Sat Jun 13 2020 08:08:28 GMT+0100 (British Summer Time)*
* UserPoolClientWeb *AWS::Cognito::UserPoolClient Sat Jun 13 2020 08:08:32 GMT+0100 (British Summer Time)*
* UserPoolClient *AWS::Cognito::UserPoolClient Sat Jun 13 2020 08:08:32 GMT+0100 (British Summer Time)*
* IdentityPool *AWS::Cognito::IdentityPool Sat Jun 13 2020 08:09:41 GMT+0100 (British Summer Time)*
* IdentityPoolRoleMap *AWS::Cognito::IdentityPoolRoleAttachment Sat Jun 13 2020 08:09:45 GMT+0100 (British Summer Time)*
* curatorGroup *AWS::Cognito::UserPoolGroup Sat Jun 13 2020 08:45:29 GMT+0100 (British Summer Time)*                            
* premiumGroup *AWS::Cognito::UserPoolGroup Sat Jun 13 2020 08:45:29 GMT+0100 (British Summer Time)* 
* adminGroup *AWS::Cognito::UserPoolGroup Sat Jun 13 2020 08:45:29 GMT+0100 (British Summer Time)*                            
* userGroup *AWS::Cognito::UserPoolGroup Sat Jun 13 2020 08:45:29 GMT+0100 (British Summer Time)* 

**Lambda**
* UserPoolClientLambda *AWS::Lambda::Function Sat Jun 13 2020 08:08:54 GMT+0100 (British Summer Time)*
* UserPoolClientInputs *Custom::LambdaCallout Sat Jun 13 2020 08:09:36 GMT+0100 (British Summer Time)*
* UpdateRolesWithIDPFunction *AWS::Lambda::Function Sat Jun 13 2020 08:09:58 GMT+0100 (British Summer Time)*
* UpdateRolesWithIDPFunctionOutputs *Custom::LambdaCallout Sat Jun 13 2020 08:10:04 GMT+0100 (British Summer Time)*
* RoleMapFunction *AWS::Lambda::Function Sat Jun 13 2020 08:45:33 GMT+0100 (British Summer Time)*
* LambdaFunction *AWS::Lambda::Function Sun Jun 14 2020 08:39:12 GMT+0100 (British Summer Time)*
* UserPoolPostConfirmationLambdaInvokePermission *AWS::Lambda::Permission Sun Jun 14 2020 08:40:01 GMT+0100 (British Summer Time)*
