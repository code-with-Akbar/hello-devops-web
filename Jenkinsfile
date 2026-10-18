pipeline {
    agent any

    environment {
        IMAGE       = "akbar2339124/hello-devops-web:${BUILD_NUMBER}"
        KUBECONFIG  = "/var/jenkins_home/.kube/config"
        TRIVY_CACHE = "/var/jenkins_home/.trivy-cache"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '5'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {
        stage('Security: Code Scan') {
            when { not { changelog '.*\\[skip ci\\].*' } }
            steps {
                sh 'trivy fs --scanners vuln,secret,misconfig --severity CRITICAL --ignore-unfixed --skip-dirs node_modules --cache-dir $TRIVY_CACHE --exit-code 1 .'
            }
        }

        stage('Build Image') {
            when { not { changelog '.*\\[skip ci\\].*' } }
            steps {
                sh 'docker build -t $IMAGE .'
            }
        }

        stage('Security: Image Scan') {
            when { not { changelog '.*\\[skip ci\\].*' } }
            steps {
                sh 'trivy image --severity CRITICAL --ignore-unfixed --cache-dir $TRIVY_CACHE --exit-code 1 $IMAGE'
            }
        }

        stage('Push Image') {
            when { not { changelog '.*\\[skip ci\\].*' } }
            steps {
                sh 'docker push $IMAGE'
            }
        }

        stage('Update GitOps Repo') {
            when { not { changelog '.*\\[skip ci\\].*' } }
            steps {
                withCredentials([usernamePassword(credentialsId: 'github-token',
                                                  usernameVariable: 'GIT_USER',
                                                  passwordVariable: 'GIT_TOKEN')]) {
                    sh '''
sed -i "s/^  tag: .*/  tag: \\"$BUILD_NUMBER\\"/" hello-web-chart/values.yaml
sed -i "s/^  appVersion: .*/  appVersion: \\"v$BUILD_NUMBER\\"/" hello-web-chart/values.yaml

if git diff --quiet; then
  echo "values.yaml mein koi change nahi, commit skip"
  exit 0
fi

git config user.email "jenkins@local"
git config user.name "Jenkins CI"
git add hello-web-chart/values.yaml
git commit -m "ci: deploy image tag $BUILD_NUMBER [skip ci]"
git push https://$GIT_USER:$GIT_TOKEN@github.com/code-with-Akbar/hello-devops-web.git HEAD:main
'''
                }
            }
        }

        stage('Verify Argo CD Sync') {
            when { not { changelog '.*\\[skip ci\\].*' } }
            steps {
                sh '''
TARGET=$(git rev-parse HEAD)
echo "Argo CD se commit $TARGET ka sync maanga ja raha hai"

kubectl annotate application hello-web -n argocd argocd.argoproj.io/refresh=hard --overwrite

for i in $(seq 1 36); do
  REV=$(kubectl get application hello-web -n argocd -o jsonpath='{.status.sync.revision}')
  SYNC=$(kubectl get application hello-web -n argocd -o jsonpath='{.status.sync.status}')
  HEALTH=$(kubectl get application hello-web -n argocd -o jsonpath='{.status.health.status}')
  echo "revision=$REV sync=$SYNC health=$HEALTH"
  if [ "$REV" = "$TARGET" ] && [ "$SYNC" = "Synced" ] && [ "$HEALTH" = "Healthy" ]; then
    echo "Argo CD ne commit $TARGET sync aur healthy kar diya"
    kubectl get pods -l app=hello-web
    exit 0
  fi
  sleep 10
done

echo "Timeout: Argo CD is commit tak sync nahi hua"
exit 1
'''
            }
        }
    }

    post {
        success {
            echo "GitOps deploy complete: ${IMAGE}"
        }
        failure {
            echo "========== PIPELINE FAILED: scan, git push ya Argo CD sync check dekho =========="
        }
    }
}
