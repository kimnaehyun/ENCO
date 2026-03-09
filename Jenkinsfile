pipeline {
    agent any

    environment {
        BACKEND_IMAGE = 'enco-backend:develop'
        BACKEND_CONTAINER = 'enco-backend'
        BACKEND_HOST_PORT = '8081'
        BACKEND_CONTAINER_PORT = '8080'
        NOTIFY_WEBHOOK = credentials('mattermost-notification')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Build') {
            steps {
                dir('enco-backend') {
                    sh '''
                    pwd
                    ls -al
                    '''
                }
            }
        }

        stage('Backend Docker Build') {
            steps {
                dir('enco-backend') {
                    sh '''
                    docker build -t ${BACKEND_IMAGE} .
                    '''
                }
            }
        }

        stage('Backend Deploy') {
            steps {
                sh '''
                docker rm -f ${BACKEND_CONTAINER} || true
                docker run -d \
                  --name ${BACKEND_CONTAINER} \
                  --restart unless-stopped \
                  -p ${BACKEND_HOST_PORT}:${BACKEND_CONTAINER_PORT} \
                  ${BACKEND_IMAGE}
                '''
            }
        }

        stage('Frontend Placeholder') {
            steps {
                sh 'echo "frontend build will be added next"'
            }
        }
    }

    post {
        success {
            sh '''
            curl -X POST -H "Content-Type: application/json" \
            --data "{\"text\":\"✅ develop 배포 성공: ${JOB_NAME} #${BUILD_NUMBER}\\n백엔드: http://j14e104.p.ssafy.io:8081\"}" \
            "$NOTIFY_WEBHOOK"
            '''
        }
        failure {
            sh '''
            curl -X POST -H "Content-Type: application/json" \
            --data "{\"text\":\"❌ develop 배포 실패: ${JOB_NAME} #${BUILD_NUMBER}\\n로그: ${BUILD_URL}\"}" \
            "$NOTIFY_WEBHOOK"
            '''
        }
    }
}