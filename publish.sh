rm index.zip
cp ./node_modules ./lambda -ar
cd lambda 
zip -r ../index.zip ./ 
cd .. 
aws lambda update-function-code --function-name MyGermanTutor --zip-file fileb://index.zip