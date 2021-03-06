import { spawn as spawnChildProcess } from 'child_process'
import { SagaReturnType } from 'redux-saga/effects'
import { getSpawnedGraphicsRendererProcessEventChannel } from '../externals/getSpawnedGraphicsRendererProcessEventChannel'
import {
  call,
  put,
  select,
  spawn,
  takeActionFromChannel,
  takeEvent,
} from '../helpers/storeEffects'
import { GraphicsRendererProcessManagerAction } from '../models/AnimationDevelopmentAction'
import {
  AnimationModuleBundlerActiveState,
  AnimationModuleBundlerState,
  AnimationModuleValidBuildState,
} from '../models/AnimationDevelopmentState'
import { SpawnedGraphicsRendererProcessEvent } from '../models/SpawnedGraphicsRendererProcessEvent'
import { animationDevelopmentSetupSaga } from './animationDevelopmentSetupSaga'

export interface GraphicsRendererProcessManagerSagaApi
  extends Pick<
    SagaReturnType<typeof animationDevelopmentSetupSaga>,
    'graphicsRendererProcessManagerActionChannel'
  > {}

export function* graphicsRendererProcessManagerSaga(
  api: GraphicsRendererProcessManagerSagaApi
) {
  const { graphicsRendererProcessManagerActionChannel } = api
  while (true) {
    const someGraphicsRendererProcessManagerAction =
      yield* takeActionFromChannel<GraphicsRendererProcessManagerAction>(
        graphicsRendererProcessManagerActionChannel
      )
    const currentAnimationModuleBundlerState = yield* select(
      (currentAnimationDevelopmentState) =>
        currentAnimationDevelopmentState.animationModuleBundlerState
    )
    if (
      someGraphicsRendererProcessManagerAction.type ===
        'animationModuleBundler_initialBuildSucceeded' ||
      someGraphicsRendererProcessManagerAction.type ===
        'animationModuleBundler_rebuildSucceeded'
    ) {
      yield* call(function* () {
        if (
          currentAnimationModuleBundlerState.bundlerStatus === 'bundlerActive'
        ) {
          terminateActiveGraphicsRendererProcesses({
            currentAnimationModuleBundlerState,
          })
        }
        yield* put({
          type: 'animationModuleBundlerStateUpdated',
          actionPayload: {
            nextAnimationModuleBundlerState: {
              bundlerStatus: 'bundlerActive',
              buildVersion:
                someGraphicsRendererProcessManagerAction.actionPayload
                  .nextBuildSessionVersion,
              buildStatus:
                someGraphicsRendererProcessManagerAction.actionPayload
                  .nextBuildStatus,
              animationModule:
                someGraphicsRendererProcessManagerAction.actionPayload
                  .nextAnimationModule,
              graphicsRendererProcessStates:
                {} as AnimationModuleBundlerActiveState['graphicsRendererProcessStates'],
            },
          },
        })
      })
    } else if (
      someGraphicsRendererProcessManagerAction.type ===
      'animationModuleBundler_rebuildFailed'
    ) {
      yield* call(function* () {
        if (
          // ??? dont think this check is necessary with better types
          currentAnimationModuleBundlerState.bundlerStatus === 'bundlerActive'
        ) {
          terminateActiveGraphicsRendererProcesses({
            currentAnimationModuleBundlerState,
          })
        }
        yield* put({
          type: 'animationModuleBundlerStateUpdated',
          actionPayload: {
            nextAnimationModuleBundlerState: {
              bundlerStatus: 'bundlerActive',
              buildVersion:
                someGraphicsRendererProcessManagerAction.actionPayload
                  .nextBuildSessionVersion,
              buildStatus:
                someGraphicsRendererProcessManagerAction.actionPayload
                  .nextBuildStatus,
              buildErrorMessage:
                someGraphicsRendererProcessManagerAction.actionPayload
                  .nextBuildErrorMessage,
              graphicsRendererProcessStates:
                {} as AnimationModuleBundlerActiveState['graphicsRendererProcessStates'],
            },
          },
        })
      })
    } else if (
      currentAnimationModuleBundlerState.bundlerStatus === 'bundlerActive' &&
      someGraphicsRendererProcessManagerAction.type ===
        'spawnGraphicsRendererProcess' &&
      currentAnimationModuleBundlerState.buildVersion ===
        someGraphicsRendererProcessManagerAction.actionPayload.buildVersion &&
      currentAnimationModuleBundlerState.graphicsRendererProcessStates[
        someGraphicsRendererProcessManagerAction.actionPayload
          .graphicsRendererProcessKey
      ] === undefined
    ) {
      yield* call(function* () {
        const { spawnedGraphicsRendererProcess } = spawnGraphicsRendererProcess(
          {
            graphicsRendererProcessCommandString:
              someGraphicsRendererProcessManagerAction.actionPayload
                .graphicsRendererProcessCommandString,
          }
        )
        const { spawnedGraphicsRendererProcessEventChannel } =
          getSpawnedGraphicsRendererProcessEventChannel({
            spawnedGraphicsRendererProcess,
          })
        yield* put({
          type: 'graphicsRendererProcessActive',
          actionPayload: {
            newGraphicsRendererProcessKey:
              someGraphicsRendererProcessManagerAction.actionPayload
                .graphicsRendererProcessKey,
            newGraphicsRendererProcessState: {
              graphicsRendererProcessKey:
                someGraphicsRendererProcessManagerAction.actionPayload
                  .graphicsRendererProcessKey,
              spawnedGraphicsRendererProcess: spawnedGraphicsRendererProcess,
              graphicsRendererProcessStatus: 'processActive',
              graphicsRendererProcessStdoutLog: '',
            },
          },
        })
        yield* spawn(function* () {
          let graphicsRendererProcessRunning = true
          while (graphicsRendererProcessRunning) {
            const someSpawnedGraphicsRendererProcessEvent =
              yield* takeEvent<SpawnedGraphicsRendererProcessEvent>(
                spawnedGraphicsRendererProcessEventChannel
              )
            switch (someSpawnedGraphicsRendererProcessEvent.eventType) {
              case 'graphicsRendererProcessStdoutLogUpdated':
                yield* put({
                  type: 'graphicsRendererProcessStdoutLogUpdated',
                  actionPayload: {
                    targetGraphicsRendererProcessKey:
                      someGraphicsRendererProcessManagerAction.actionPayload
                        .graphicsRendererProcessKey,
                    buildVersion:
                      currentAnimationModuleBundlerState.buildVersion,
                    targetGraphicsRendererProcessStateUpdates: {
                      graphicsRendererProcessStdoutLog:
                        someSpawnedGraphicsRendererProcessEvent.eventPayload
                          .updatedGraphicsRendererProcessStdoutLog,
                    },
                  },
                })
                break
              case 'graphicsRendererProcessSuccessful':
                yield* put({
                  type: 'graphicsRendererProcessSuccessful',
                  actionPayload: {
                    targetGraphicAssetKey:
                      someGraphicsRendererProcessManagerAction.actionPayload
                        .graphicAssetPathKey,
                    targetGraphicAssetPath:
                      someGraphicsRendererProcessManagerAction.actionPayload
                        .graphicAssetPath,
                    targetGraphicsRendererProcessKey:
                      someGraphicsRendererProcessManagerAction.actionPayload
                        .graphicsRendererProcessKey,
                    buildVersion:
                      currentAnimationModuleBundlerState.buildVersion,
                    targetGraphicsRendererProcessStateUpdates: {
                      graphicAssetUrl:
                        someGraphicsRendererProcessManagerAction.actionPayload
                          .graphicAssetUrlResult,
                      graphicsRendererProcessStatus: 'processSuccessful',
                    },
                  },
                })
                break
              case 'graphicsRendererProcessFailed':
                yield* put({
                  type: 'graphicsRendererProcessFailed',
                  actionPayload: {
                    targetGraphicsRendererProcessKey:
                      someGraphicsRendererProcessManagerAction.actionPayload
                        .graphicsRendererProcessKey,
                    buildVersion:
                      currentAnimationModuleBundlerState.buildVersion,
                    targetGraphicsRendererProcessStateUpdates: {
                      graphicsRendererProcessErrorMessage:
                        someSpawnedGraphicsRendererProcessEvent.eventPayload
                          .graphicsRendererProcessErrorMessage,
                      graphicsRendererProcessStatus: 'processFailed',
                    },
                  },
                })
                break
              case 'graphicsRendererProcessTerminated':
                break
            }
            if (
              someSpawnedGraphicsRendererProcessEvent.eventType ===
                'graphicsRendererProcessSuccessful' ||
              someSpawnedGraphicsRendererProcessEvent.eventType ===
                'graphicsRendererProcessFailed' ||
              someSpawnedGraphicsRendererProcessEvent.eventType ===
                'graphicsRendererProcessTerminated'
            ) {
              graphicsRendererProcessRunning = false
            }
          }
        })
      })
    }
  }
}

interface TerminateActiveGraphicsRenderProcessesApi {
  currentAnimationModuleBundlerState: AnimationModuleBundlerActiveState
}

function terminateActiveGraphicsRendererProcesses(
  api: TerminateActiveGraphicsRenderProcessesApi
) {
  const { currentAnimationModuleBundlerState } = api
  Object.values(
    currentAnimationModuleBundlerState.graphicsRendererProcessStates
  ).forEach((someGraphicsRendererProcessState) => {
    someGraphicsRendererProcessState.spawnedGraphicsRendererProcess.kill(
      'SIGINT'
    )
  })
}

export interface SpawnGraphicsRendererProcessApi {
  graphicsRendererProcessCommandString: string
}

export function spawnGraphicsRendererProcess(
  api: SpawnGraphicsRendererProcessApi
) {
  const { graphicsRendererProcessCommandString } = api
  const graphicsRendererCommandTokens =
    graphicsRendererProcessCommandString.split(' ')
  const [
    mainGraphicsRendererCommandToken,
    ...graphicsRendererCommandArgumentTokens
  ] = graphicsRendererCommandTokens
  const spawnedGraphicsRendererProcess = spawnChildProcess(
    mainGraphicsRendererCommandToken!,
    graphicsRendererCommandArgumentTokens,
    {
      stdio: 'pipe',
    }
  )
  return {
    spawnedGraphicsRendererProcess,
  }
}
