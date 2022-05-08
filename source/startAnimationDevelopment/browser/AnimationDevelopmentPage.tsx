import { makeStyles, Theme, useTheme } from '@material-ui/core/styles'
import React, { Fragment, HTMLAttributes, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ClientGraphicsRendererProcessInvalidBundleState,
  ClientGraphicsRendererProcessState,
  ClientGraphicsRendererProcessSuccessfulState,
  ClientGraphicsRendererProcessValidBundleState,
} from '../models/ClientGraphicsRendererProcessState'

export interface AnimationDevelopmentResultPageProps<
  AssetRoute extends '/animation' | `/frame/${number}`
> extends Pick<
    AnimationDevelopmentPageProps<AssetRoute, '/result'>,
    'assetRoute' | 'viewRoute'
  > {
  SomeAssetDisplay: (props: SomeAssetDisplayProps) => JSX.Element
}

export interface SomeAssetDisplayProps
  extends Pick<
    ClientGraphicsRendererProcessSuccessfulState,
    'graphicAssetUrl'
  > {}

export function AnimationDevelopmentResultPage<
  AssetRoute extends '/animation' | `/frame/${number}`
>(props: AnimationDevelopmentResultPageProps<AssetRoute>) {
  const { assetRoute, viewRoute, SomeAssetDisplay } = props
  const styles = useAnimationDevelopmentResultPageStyles()
  return (
    <AnimationDevelopmentPage
      assetRoute={assetRoute}
      viewRoute={viewRoute}
      SomeClientGraphicsRendererProcessPage={({
        clientGraphicsRendererProcessState,
      }) => {
        switch (clientGraphicsRendererProcessState.latestBundleStatus) {
          case 'bundleInvalid':
            return (
              <InvalidBundleClientGraphicsRendererProcessPage
                assetRoute={assetRoute}
                viewRoute={viewRoute}
                clientGraphicsRendererProcessState={
                  clientGraphicsRendererProcessState
                }
                viewRouteContent={
                  <div className={styles.errorMessageContainer}>
                    <div className={styles.processErrorMessage}>
                      {clientGraphicsRendererProcessState.bundleErrorMessage}
                    </div>
                  </div>
                }
              />
            )
          case 'bundleValid':
            switch (
              clientGraphicsRendererProcessState.graphicsRendererProcessStatus
            ) {
              case 'processInitializing':
              case 'processActive':
                return (
                  <ValidBundleClientGraphicsRendererProcessPage
                    assetRoute={assetRoute}
                    viewRoute={viewRoute}
                    clientGraphicsRendererProcessState={
                      clientGraphicsRendererProcessState
                    }
                    viewRouteContent={
                      <div className={styles.inProgressContainer}>
                        in progress...
                      </div>
                    }
                  />
                )
              case 'processSuccessful':
                return (
                  <ValidBundleClientGraphicsRendererProcessPage
                    assetRoute={assetRoute}
                    viewRoute={viewRoute}
                    clientGraphicsRendererProcessState={
                      clientGraphicsRendererProcessState
                    }
                    viewRouteContent={
                      <div className={styles.assetContainer}>
                        <SomeAssetDisplay
                          graphicAssetUrl={
                            clientGraphicsRendererProcessState.graphicAssetUrl
                          }
                        />
                      </div>
                    }
                  />
                )
              case 'processFailed':
                return (
                  <ValidBundleClientGraphicsRendererProcessPage
                    assetRoute={assetRoute}
                    viewRoute={viewRoute}
                    clientGraphicsRendererProcessState={
                      clientGraphicsRendererProcessState
                    }
                    viewRouteContent={
                      <div className={styles.errorMessageContainer}>
                        <div className={styles.processErrorMessage}>
                          {
                            clientGraphicsRendererProcessState.processErrorMessage
                          }
                        </div>
                      </div>
                    }
                  />
                )
            }
        }
      }}
    />
  )
}

const useAnimationDevelopmentResultPageStyles = makeStyles((theme) => ({
  inProgressContainer: {
    padding: theme.spacing(1),
  },
  assetContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 0,
    padding: theme.spacing(1),
  },
  errorMessageContainer: {
    flexShrink: 1,
    flexGrow: 1,
    overflow: 'scroll',
    padding: theme.spacing(1),
  },
  processErrorMessage: {
    backgroundColor: theme.palette.error.main,
    maxWidth: 600,
    padding: theme.spacing(1),
    whiteSpace: 'pre-wrap',
    color: theme.palette.getContrastText(theme.palette.error.main),
    fontSize: 14,
  },
}))

export interface AnimationDevelopmentLogsPageProps<
  AssetRoute extends '/animation' | `/frame/${number}`
> extends Pick<
    AnimationDevelopmentPageProps<AssetRoute, '/logs'>,
    'assetRoute' | 'viewRoute'
  > {}

export function AnimationDevelopmentLogsPage<
  AssetRoute extends '/animation' | `/frame/${number}`
>(props: AnimationDevelopmentLogsPageProps<AssetRoute>) {
  const { assetRoute, viewRoute } = props
  const styles = useAnimationDevelopmentLogsPageStyles()
  return (
    <AnimationDevelopmentPage
      assetRoute={assetRoute}
      viewRoute={viewRoute}
      SomeClientGraphicsRendererProcessPage={({
        clientGraphicsRendererProcessState,
      }) => {
        switch (clientGraphicsRendererProcessState.latestBundleStatus) {
          case 'bundleInvalid':
            return (
              <InvalidBundleClientGraphicsRendererProcessPage
                assetRoute={assetRoute}
                viewRoute={viewRoute}
                clientGraphicsRendererProcessState={
                  clientGraphicsRendererProcessState
                }
                viewRouteContent={
                  <div className={styles.logsDisplayContainer}>
                    todo invalid bundle
                  </div>
                }
              />
            )
          case 'bundleValid':
            return (
              <ValidBundleClientGraphicsRendererProcessPage
                assetRoute={assetRoute}
                viewRoute={viewRoute}
                clientGraphicsRendererProcessState={
                  clientGraphicsRendererProcessState
                }
                viewRouteContent={
                  <div className={styles.logsDisplayContainer}>
                    {clientGraphicsRendererProcessState.processStdoutLog}
                  </div>
                }
              />
            )
        }
      }}
    />
  )
}

const useAnimationDevelopmentLogsPageStyles = makeStyles((theme) => ({
  logsDisplayContainer: {
    flexShrink: 1,
    flexGrow: 1,
    padding: theme.spacing(1),
    overflow: 'scroll',
    lineHeight: '1.25rem',
    whiteSpace: 'pre-wrap',
    fontSize: 12,
  },
}))

interface AnimationDevelopmentPageProps<
  AssetRoute extends '/animation' | `/frame/${number}`,
  ViewRoute extends '/logs' | '/result'
> {
  assetRoute: AssetRoute
  viewRoute: ViewRoute
  SomeClientGraphicsRendererProcessPage: (
    props: SomeClientGraphicsRendererProcessPageProps
  ) => JSX.Element
}

interface SomeClientGraphicsRendererProcessPageProps
  extends Pick<
    PollClientGraphicsRendererProcessStateSuccessResponse,
    'clientGraphicsRendererProcessState'
  > {}

function AnimationDevelopmentPage<
  AssetRoute extends '/animation' | `/frame/${number}`,
  ViewRoute extends '/logs' | '/result'
>(props: AnimationDevelopmentPageProps<AssetRoute, ViewRoute>) {
  const { SomeClientGraphicsRendererProcessPage } = props
  const { pollClientGraphicsRendererProcessStateResponse } =
    usePollClientGraphicsRendererProcessStateResponse()
  const styles = useAnimationDevelopmentPageStyles()
  switch (pollClientGraphicsRendererProcessStateResponse.responseStatus) {
    case 'serverInitializing':
      return (
        <div className={styles.responseStatusDisplayContainer}>
          initializing...
        </div>
      )
    case 'serverError':
      return (
        <div
          className={`${styles.responseStatusDisplayContainer} ${styles.responseStatusError}`}
        >
          wtf? server
        </div>
      )
    case 'fetchError':
      return (
        <div
          className={`${styles.responseStatusDisplayContainer} ${styles.responseStatusError}`}
        >
          {pollClientGraphicsRendererProcessStateResponse.fetchErrorMessage}
        </div>
      )
    case 'fetchSuccessful':
      const { clientGraphicsRendererProcessState } =
        pollClientGraphicsRendererProcessStateResponse
      return (
        <SomeClientGraphicsRendererProcessPage
          clientGraphicsRendererProcessState={
            clientGraphicsRendererProcessState
          }
        />
      )
  }
}

const useAnimationDevelopmentPageStyles = makeStyles((theme) => ({
  responseStatusDisplayContainer: {
    padding: theme.spacing(1),
  },
  responseStatusError: {
    color: theme.palette.error.main,
  },
}))

type PollClientGraphicsRendererProcessStateResponse =
  | PollClientGraphicsRendererProcessStateServerInitializingResponse
  | PollClientGraphicsRendererProcessStateSuccessResponse
  | PollClientGraphicsRendererProcessStateClientErrorResponse
  | PollClientGraphicsRendererProcessStateServerErrorResponse

interface PollClientGraphicsRendererProcessStateServerInitializingResponse
  extends PollClientGraphicsRendererProcessStateBase<
    'serverInitializing',
    204
  > {}

interface PollClientGraphicsRendererProcessStateSuccessResponse
  extends PollClientGraphicsRendererProcessStateBase<'fetchSuccessful', 200> {
  clientGraphicsRendererProcessState: ClientGraphicsRendererProcessState
}

interface PollClientGraphicsRendererProcessStateClientErrorResponse
  extends PollClientGraphicsRendererProcessStateBase<'fetchError', 400> {
  fetchErrorMessage: string
}

interface PollClientGraphicsRendererProcessStateServerErrorResponse
  extends PollClientGraphicsRendererProcessStateBase<'serverError', 500> {}

interface PollClientGraphicsRendererProcessStateBase<
  ResponseStatus extends string,
  ResponseStatusCode extends number
> {
  responseStatus: ResponseStatus
  responseStatusCode: ResponseStatusCode
}

function usePollClientGraphicsRendererProcessStateResponse(): {
  pollClientGraphicsRendererProcessStateResponse: PollClientGraphicsRendererProcessStateResponse
} {
  return null
}

interface InvalidBundleClientGraphicsRendererProcessPageProps<
  AssetRoute extends '/animation' | `/frame/${number}`,
  ViewRoute extends '/logs' | '/result'
> extends Pick<
    ClientGraphicsRendererProcessPageProps<AssetRoute, ViewRoute>,
    'assetRoute' | 'viewRoute' | 'viewRouteContent'
  > {
  clientGraphicsRendererProcessState: ClientGraphicsRendererProcessInvalidBundleState
}

function InvalidBundleClientGraphicsRendererProcessPage<
  AssetRoute extends '/animation' | `/frame/${number}`,
  ViewRoute extends '/logs' | '/result'
>(
  props: InvalidBundleClientGraphicsRendererProcessPageProps<
    AssetRoute,
    ViewRoute
  >
) {
  const {
    assetRoute,
    viewRoute,
    viewRouteContent,
    clientGraphicsRendererProcessState,
  } = props
  return (
    <ClientGraphicsRendererProcessPage
      assetRoute={assetRoute}
      viewRoute={viewRoute}
      viewRouteContent={viewRouteContent}
      moduleStatusDisplayValue={'module invalid'}
      animationNameDisplayValue={'-'}
      processKeyDisplayValue={'-'}
      processStatusDisplayValue={'-'}
      moduleSessionVersionDisplayValue={`${clientGraphicsRendererProcessState.bundleSessionVersion}`}
    />
  )
}

interface ValidBundleClientGraphicsRendererProcessPageProps<
  AssetRoute extends '/animation' | `/frame/${number}`,
  ViewRoute extends '/logs' | '/result'
> extends Pick<
    ClientGraphicsRendererProcessPageProps<AssetRoute, ViewRoute>,
    'assetRoute' | 'viewRoute' | 'viewRouteContent'
  > {
  clientGraphicsRendererProcessState: ClientGraphicsRendererProcessValidBundleState
}

function ValidBundleClientGraphicsRendererProcessPage<
  AssetRoute extends '/animation' | `/frame/${number}`,
  ViewRoute extends '/logs' | '/result'
>(
  props: ValidBundleClientGraphicsRendererProcessPageProps<
    AssetRoute,
    ViewRoute
  >
) {
  const {
    assetRoute,
    viewRoute,
    viewRouteContent,
    clientGraphicsRendererProcessState,
  } = props
  return (
    <ClientGraphicsRendererProcessPage
      assetRoute={assetRoute}
      viewRoute={viewRoute}
      viewRouteContent={viewRouteContent}
      animationNameDisplayValue={
        clientGraphicsRendererProcessState.animationModule.animationName
      }
      processKeyDisplayValue={
        clientGraphicsRendererProcessState.graphicsRendererProcessKey
      }
      processStatusDisplayValue={
        clientGraphicsRendererProcessState.graphicsRendererProcessStatus
      }
      moduleStatusDisplayValue={'module valid'}
      moduleSessionVersionDisplayValue={`${clientGraphicsRendererProcessState.bundleSessionVersion}`}
    />
  )
}

interface ClientGraphicsRendererProcessPageProps<
  AssetRoute extends '/animation' | `/frame/${number}`,
  ViewRoute extends '/logs' | '/result'
> extends Pick<
    AnimationDevelopmentPageProps<AssetRoute, ViewRoute>,
    'assetRoute' | 'viewRoute'
  > {
  moduleSessionVersionDisplayValue: string
  moduleStatusDisplayValue: string
  animationNameDisplayValue: string
  processKeyDisplayValue: string
  processStatusDisplayValue: string
  viewRouteContent: ReactNode
}

function ClientGraphicsRendererProcessPage<
  AssetRoute extends '/animation' | `/frame/${number}`,
  ViewRoute extends '/logs' | '/result'
>(props: ClientGraphicsRendererProcessPageProps<AssetRoute, ViewRoute>) {
  const {
    viewRoute,
    assetRoute,
    moduleSessionVersionDisplayValue,
    moduleStatusDisplayValue,
    animationNameDisplayValue,
    processKeyDisplayValue,
    processStatusDisplayValue,
    viewRouteContent,
  } = props
  const navigateToRoute = useNavigate()
  const styles = useClientGraphicsRendererProcessPageStyles()
  return (
    <Page
      pageBody={
        <Fragment>
          <div className={styles.pageOverviewContainer}>
            <div className={styles.pageNavigationContainer}>
              <OptionField
                optionLabel={'logs'}
                optionSelected={viewRoute === '/logs'}
                onClick={() => {
                  navigateToRoute(`${assetRoute}/logs`)
                }}
              />
              <OptionField
                optionLabel={'result'}
                optionSelected={viewRoute === '/result'}
                onClick={() => {
                  navigateToRoute(`${assetRoute}/result`)
                }}
              />
            </div>
            <div className={styles.pageDetailsContainer}>
              <FieldDisplay
                fieldLabel={'module session version'}
                fieldValue={moduleSessionVersionDisplayValue}
              />
              <FieldDisplay
                fieldLabel={'module status'}
                fieldValue={moduleStatusDisplayValue}
              />
              <FieldDisplay
                fieldLabel={'animation name'}
                fieldValue={animationNameDisplayValue}
              />
              <FieldDisplay
                fieldLabel={'process key'}
                fieldValue={processKeyDisplayValue}
              />
              <FieldDisplay
                fieldLabel={'process status'}
                fieldValue={processStatusDisplayValue}
              />
            </div>
          </div>
          {viewRouteContent}
        </Fragment>
      }
    />
  )
}

const useClientGraphicsRendererProcessPageStyles = makeStyles((theme) => ({
  pageOverviewContainer: {
    borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    borderBottomColor: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[100],
    display: 'flex',
    flexDirection: 'row',
    paddingLeft: theme.spacing(1.5),
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1),
  },
  pageNavigationContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  pageDetailsContainer: {},
}))

interface OptionFieldProps
  extends Pick<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  optionLabel: string
  optionSelected: boolean
}

function OptionField(props: OptionFieldProps) {
  const { optionLabel, optionSelected, onClick } = props
  const theme = useTheme()
  const styles = useOptionFieldStyles(props)
  return (
    <div className={styles.fieldContainer}>
      <div className={styles.optionInputContainer}>
        <div className={styles.optionInput} onClick={onClick}>
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: optionSelected
                ? theme.palette.primary.main
                : theme.palette.common.white,
            }}
          />
        </div>
      </div>
      <div className={styles.optionLabel}>{optionLabel}</div>
    </div>
  )
}

const useOptionFieldStyles = makeStyles<Theme, OptionFieldProps>((theme) => ({
  fieldContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  optionInputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: theme.spacing(1),
  },
  optionInput: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: ({ optionSelected }) =>
      optionSelected ? theme.palette.primary.main : theme.palette.primary.light,
    backgroundColor: theme.palette.common.white,
    width: theme.spacing(1.25),
    height: theme.spacing(1.25),
    padding: 2,
  },
  optionLabel: {
    fontWeight: 600,
  },
}))

interface FieldDisplayProps {
  fieldLabel: string
  fieldValue: string
}

function FieldDisplay(props: FieldDisplayProps) {
  const { fieldLabel, fieldValue } = props
  const styles = useFieldDisplayStyles()
  return (
    <div className={styles.displayContainer}>
      <div className={styles.fieldLabel}>{fieldLabel.toLowerCase()}:</div>
      <div className={styles.fieldValue}>{fieldValue.toLowerCase()}</div>
    </div>
  )
}

const useFieldDisplayStyles = makeStyles((theme) => ({
  displayContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  fieldLabel: {
    fontWeight: 300,
    fontSize: 14,
  },
  fieldValue: {
    fontWeight: 500,
    fontSize: 14,
    marginLeft: theme.spacing(1),
  },
}))

export interface PageProps {
  pageBody: ReactNode
}

export function Page(props: PageProps) {
  const { pageBody } = props
  const styles = usePageStyles()
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.pageTitle}>graphics-renderer</div>
      </div>
      {pageBody}
    </div>
  )
}

export const usePageStyles = makeStyles((theme) => ({
  '@global': {
    body: {
      fontFamily: theme.typography.fontFamily,
    },
  },
  pageContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  pageHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(1.5),
  },
  pageTitle: {
    fontWeight: 600,
    fontSize: 18,
    color: theme.palette.common.white,
  },
}))
