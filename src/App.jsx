import { useState, useEffect } from 'react'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import RepoSelector from './components/RepoSelector'
import DeployPage from './components/DeployPage'
import SuccessPage from './components/SuccessPage'
import DeploymentDetail from './components/DeploymentDetail'
import './index.css'

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; Path=/`
}

export default function App() {
  const [stage, setStage] = useState('landing')
  const [githubUser, setGithubUser] = useState(null)
  const [githubToken, setGithubToken] = useState(null)
  const [deployData, setDeployData] = useState(null)
  const [result, setResult] = useState(null)
  const [selectedDeployment, setSelectedDeployment] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const auth = params.get('auth')

    if (auth === 'success') {
      const token = getCookie('gh_token')
      const login = params.get('login')
      const name = params.get('name')
      const avatar = params.get('avatar')

      if (token) {
        setGithubToken(token)
        setGithubUser({ login, name, avatar })
        sessionStorage.setItem('gh_token', token)
        sessionStorage.setItem('gh_user', JSON.stringify({ login, name, avatar }))
        setStage('dashboard')
        deleteCookie('gh_token')
      }

      window.history.replaceState({}, '', window.location.pathname)
    } else {
      // Try to restore session
      const savedToken = sessionStorage.getItem('gh_token')
      const savedUser = sessionStorage.getItem('gh_user')
      if (savedToken && savedUser) {
        setGithubToken(savedToken)
        setGithubUser(JSON.parse(savedUser))
        setStage('dashboard')
      }
    }
  }, [])

  function handleNewDeploy() {
    setStage('select-repo')
  }

  function handleOpenDeployment(dep) {
    setSelectedDeployment(dep)
    setStage('deployment-detail')
  }

  function handleBackToDashboard() {
    setSelectedDeployment(null)
    setStage('dashboard')
  }

  function handleRepoSelected(data) {
    setDeployData({ ...data, githubToken })
    setStage('deploying')
  }

  function handleComplete(res) {
    setResult(res)
    setStage('success')
  }

  function handleReset() {
    setDeployData(null)
    setResult(null)
    setStage('dashboard')
  }

  function handleLogout() {
    sessionStorage.removeItem('gh_token')
    sessionStorage.removeItem('gh_user')
    setDeployData(null)
    setResult(null)
    setGithubUser(null)
    setGithubToken(null)
    setStage('landing')
  }

  if (stage === 'dashboard') {
    return (
      <Dashboard
        user={githubUser}
        onNewDeploy={handleNewDeploy}
        onLogout={handleLogout}
        onOpenDeployment={handleOpenDeployment}
      />
    )
  }

  if (stage === 'deployment-detail' && selectedDeployment) {
    return (
      <DeploymentDetail
        deployment={selectedDeployment}
        onBack={handleBackToDashboard}
      />
    )
  }

  if (stage === 'select-repo') {
    return (
      <RepoSelector
        user={githubUser}
        token={githubToken}
        onSelect={handleRepoSelected}
      />
    )
  }

  if (stage === 'deploying') {
    return (
      <DeployPage
        projectName={deployData.projectName}
        repoUrl={deployData.repoUrl}
        githubToken={deployData.githubToken}
        clientLogin={githubUser?.login}
        onComplete={handleComplete}
      />
    )
  }

  if (stage === 'success') {
    return (
      <SuccessPage
        projectName={deployData.projectName}
        repoUrl={deployData.repoUrl}
        result={result}
        onReset={handleReset}
      />
    )
  }

  return <LandingPage />
}
