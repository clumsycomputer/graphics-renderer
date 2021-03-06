import * as IO from 'io-ts'
import { ConvertAnimationMp4ToGifApi } from '../convertAnimationMp4ToGif/convertAnimationMp4ToGif'
import { BooleanFromString, NumberFromString } from '../helpers/codecTypes'
import { RenderAnimationModuleApi } from '../renderAnimationModule/renderAnimationModule'
import { StartAnimationDevelopmentApi } from '../startAnimationDevelopment/startAnimationDevelopment'
import { Optional } from './common'

export type ClumsyGraphicsCommand =
  | StartDevelopmentCommand
  | RenderAnimationCommand
  | RenderAnimationFrameCommand
  | ConvertAnimationToGifCommand

export interface StartDevelopmentCommand
  extends CliCommandBase<
    'startDevelopment',
    Optional<
      StartAnimationDevelopmentApi,
      | 'clientServerPort'
      | 'generatedAssetsDirectoryPath'
      | 'numberOfFrameRendererWorkers'
    >
  > {}

export const StartDevelopmentCommandCodec = IO.exact(
  IO.type({
    commandName: IO.literal('startDevelopment'),
    commandApi: IO.exact(
      IO.intersection([
        IO.type({
          animationModulePath: IO.string,
        }),
        IO.partial({
          clientServerPort: NumberFromString,
          generatedAssetsDirectoryPath: IO.string,
          numberOfFrameRendererWorkers: NumberFromString,
        }),
      ])
    ),
  })
)

interface RenderAnimationCommand
  extends CliCommandBase<
    'renderAnimation',
    Optional<
      RenderAnimationModuleApi,
      'numberOfFrameRendererWorkers' | 'suppressWorkerStdout'
    >
  > {}

const RenderAnimationCommandCodec = IO.exact(
  IO.type({
    commandName: IO.literal('renderAnimation'),
    commandApi: IO.exact(
      IO.intersection([
        IO.type({
          animationModulePath: IO.string,
          animationMp4OutputPath: IO.string,
        }),
        IO.partial({
          numberOfFrameRendererWorkers: NumberFromString,
          suppressWorkerStdout: BooleanFromString,
        }),
      ])
    ),
  })
)

interface RenderAnimationFrameCommand
  extends CliCommandBase<
    'renderAnimationFrame',
    {
      animationModulePath: string
      frameFileOutputPath: string
      frameIndex: number
    }
  > {}

const RenderAnimationFrameCommandCodec = IO.exact(
  IO.type({
    commandName: IO.literal('renderAnimationFrame'),
    commandApi: IO.exact(
      IO.type({
        animationModulePath: IO.string,
        frameFileOutputPath: IO.string,
        frameIndex: NumberFromString,
      })
    ),
  })
)

interface ConvertAnimationToGifCommand
  extends CliCommandBase<
    'convertAnimationToGif',
    ConvertAnimationMp4ToGifApi
  > {}

const ConvertAnimationToGifCommandCodec = IO.exact(
  IO.type({
    commandName: IO.literal('convertAnimationToGif'),
    commandApi: IO.exact(
      IO.intersection([
        IO.type({
          animationMp4SourcePath: IO.string,
          animationGifOutputPath: IO.string,
        }),
        IO.partial({
          gifAspectRatioWidth: NumberFromString,
        }),
      ])
    ),
  })
)

interface CliCommandBase<
  CommandName extends string,
  CommandOptions extends object
> {
  commandName: CommandName
  commandApi: CommandOptions
}

export const ClumsyGraphicsCommandCodec = IO.union([
  StartDevelopmentCommandCodec,
  RenderAnimationCommandCodec,
  RenderAnimationFrameCommandCodec,
  ConvertAnimationToGifCommandCodec,
])

export interface ParseCommandLineArgsApi {
  processArgv: Array<string>
}

export function parseCommandLineArgs(api: ParseCommandLineArgsApi): unknown {
  const { processArgv } = api
  return {
    commandName: processArgv[2],
    commandApi: processArgv
      .slice(3)
      .reduce<Record<string, string>>((result, someProcessArg) => {
        const optionMatch = someProcessArg.match(/^--([a-zA-Z0-9]+)=(.+)$/)
        if (optionMatch) {
          const optionKey: string = optionMatch[1]!
          const optionValue: string = optionMatch[2]!
          result[optionKey] = optionValue
        }
        return result
      }, {}),
  }
}
