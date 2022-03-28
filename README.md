_**ECG Authentication & Services API**_
- Written in Javascript using Node.js with the Express framework. 
- Authentication implemented using Java Web Token stored in LocalStorage (client-side). 
- Includes JWT Refresh token implementation which is facilitated using axios interceptors on the client side to ensure users can maintain a uninterrupted authenticated session (for 24 hours). 
- Axios interceptors are used to check JWT expiration.  

_**Overall Architecture**_
- Uses Model, View Controller software design pattern to separate internal representations of information from the ways information is presented to and accepted from the user.
- Also contains middleware which includes middle functions such as authenticating JWT tokens, checking if user is an admin, configuration of server storage for user uploaded images and various other features.  
- The controller and routes can be divided up into 6 core sections which each represent an area present within the frontend of the application. Admin, authentication, courses, quizzes, users, and forum. 

_**CI/CD**_
- Contains a .env file (not present in this repository) to contain environment variables which are injected during runtime. Most important variable being the NODE_ENV which I have configured to either be test or production. 
- Dockerfile is used to build a container which is used for deployment to production (server provided by Charles Gillan). 
- Deployment pipeline configured in gitlab-ci.yml file. Pipeline contains 3 main jobs; lint code, test code and deployment (deployment is configured using SSH within Gitlab runner to automate deployment to server on each commit to master branch).
