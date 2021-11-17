import React, { ReactNode, useEffect, useState } from 'react'
import ReactDom from 'react-dom'
import {
  BrowserRouter,
  Route,
  Routes,
  useParams as useRouteParams,
} from 'react-router-dom'

const appContainer = document.createElement('div')
document.body.append(appContainer)
ReactDom.render(
  <BrowserRouter>
    <ClientApp />
  </BrowserRouter>,
  appContainer
)

function ClientApp() {
  return (
    <Routes>
      <Route
        path={'/latestAnimationModule/animation'}
        element={<AnimationPage />}
      />
      <Route
        path={'/latestAnimationModule/frame/:frameIndex'}
        element={<FramePage />}
      />
    </Routes>
  )
}

function AnimationPage() {
  const [animationRenderProcessState, setAnimationRenderProcessState] =
    useState<any>(null)
  useEffect(() => {
    setInterval(() => {
      fetch('/api/latestAnimationModule/animationRenderProcessState')
        .then((fetchResult) => fetchResult.json())
        .then((nextAnimationRenderProcessState) => {
          setAnimationRenderProcessState(nextAnimationRenderProcessState)
        })
        .catch((fetchAnimationRenderProcessStateError) => {
          console.error(fetchAnimationRenderProcessStateError)
        })
    }, 500)
  }, [])
  if (animationRenderProcessState?.processStatus === 'processSuccessful') {
    return (
      <PageContainer>
        <AssetContainer>
          <video
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            controls={true}
            loop={true}
            autoPlay={true}
          >
            <source
              type={'video/mp4'}
              src={animationRenderProcessState.animationAssetUrl}
            />
          </video>
        </AssetContainer>
      </PageContainer>
    )
  } else if (animationRenderProcessState?.processStatus === 'processActive') {
    return (
      <div>
        {animationRenderProcessState.lastProcessMessage ||
          'starting animation render...'}
      </div>
    )
  } else if (animationRenderProcessState?.processStatus === 'processFailed') {
    return (
      <div
        style={{
          whiteSpace: 'pre-wrap',
          backgroundColor: 'red',
          color: 'white',
        }}
      >
        {animationRenderProcessState.processErrorMessage}
      </div>
    )
  } else {
    return null
  }
}

function FramePage() {
  const framePageParams = useRouteParams()
  const [frameRenderProcessState, setFrameRenderProcessState] =
    useState<any>(null)
  useEffect(() => {
    setInterval(() => {
      fetch(
        `/api/latestAnimationModule/frameRenderProcessState/${framePageParams.frameIndex}`
      )
        .then((fetchResult) => fetchResult.json())
        .then((nextFrameRenderProcessState) => {
          setFrameRenderProcessState(nextFrameRenderProcessState)
        })
        .catch((fetchFrameRenderProcessStateError) => {
          console.error(fetchFrameRenderProcessStateError)
        })
    }, 500)
  }, [])
  if (frameRenderProcessState?.processStatus === 'processSuccessful') {
    return (
      <PageContainer>
        <AssetContainer>
          <img
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            src={frameRenderProcessState.frameAssetUrl}
          />
        </AssetContainer>
      </PageContainer>
    )
  } else if (frameRenderProcessState?.processStatus === 'processActive') {
    return (
      <div>
        {frameRenderProcessState.lastProcessMessage ||
          `rendering frame: ${framePageParams.frameIndex}`}
      </div>
    )
  } else if (frameRenderProcessState?.processStatus === 'processFailed') {
    return (
      <div
        style={{
          whiteSpace: 'pre-wrap',
          backgroundColor: 'red',
          color: 'white',
        }}
      >
        {frameRenderProcessState.processErrorMessage}
      </div>
    )
  } else {
    return null
  }
}

interface PageContainerProps {
  children: ReactNode
}

function PageContainer(props: PageContainerProps) {
  const { children } = props
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  )
}

interface AssetContainerProps {
  children: ReactNode
}

function AssetContainer(props: AssetContainerProps) {
  const { children } = props
  return (
    <div
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    >
      {children}
    </div>
  )
}