pipeline {
    agent any

    environment {
        REGISTRY = 'docker.io'
        IMAGE_BACKEND = 'codelens-backend'
        IMAGE_FRONTEND = 'codelens-frontend'
        JAVA_HOME = '/usr/lib/jvm/java-17-openjdk'
    }

    tools {
        maven 'Maven 3.9'
        nodejs 'Node 22'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '=== Checking out source code ==='
                checkout scm
            }
        }

        stage('Backend Build') {
            steps {
                echo '=== Building Spring Boot backend ==='
                dir('backend') {
                    sh 'mvn clean package -DskipTests -B'
                }
            }
        }

        stage('Backend Test') {
            steps {
                echo '=== Running backend tests ==='
                dir('backend') {
                    sh 'mvn test -B'
                }
            }
            post {
                always {
                    publishTestResults testResultsPattern: 'backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                echo '=== Building React frontend ==='
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build') {
            when { branch 'main' }
            steps {
                echo '=== Building Docker images ==='
                sh "docker build -t ${IMAGE_BACKEND}:${BUILD_NUMBER} ./backend"
                sh "docker build -t ${IMAGE_FRONTEND}:${BUILD_NUMBER} ./frontend"
                sh "docker tag ${IMAGE_BACKEND}:${BUILD_NUMBER} ${IMAGE_BACKEND}:latest"
                sh "docker tag ${IMAGE_FRONTEND}:${BUILD_NUMBER} ${IMAGE_FRONTEND}:latest"
            }
        }

        stage('Docker Push') {
            when { branch 'main' }
            steps {
                echo '=== Pushing Docker images ==='
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                    sh "docker push ${IMAGE_BACKEND}:${BUILD_NUMBER}"
                    sh "docker push ${IMAGE_BACKEND}:latest"
                    sh "docker push ${IMAGE_FRONTEND}:${BUILD_NUMBER}"
                    sh "docker push ${IMAGE_FRONTEND}:latest"
                }
            }
        }

        stage('Deploy') {
            when { branch 'main' }
            steps {
                echo '=== Deploying to server ==='
                withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh """
                        ssh -i $SSH_KEY -o StrictHostKeyChecking=no ec2-user@\${EC2_HOST} '
                            cd /opt/codelens
                            docker-compose pull
                            docker-compose up -d --remove-orphans
                            docker system prune -f
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo '=== Pipeline succeeded! ==='
        }
        failure {
            echo '=== Pipeline failed! ==='
        }
        always {
            echo '=== Cleaning workspace ==='
            cleanWs()
        }
    }
}
