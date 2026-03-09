pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Workspace') {
            steps {
                sh '''
                echo "===== ROOT ====="
                pwd
                ls -al
                echo "===== enco-backend ====="
                ls -al enco-backend || true
                echo "===== enco-frontend ====="
                ls -al enco-frontend || true
                '''
            }
        }
    }
}