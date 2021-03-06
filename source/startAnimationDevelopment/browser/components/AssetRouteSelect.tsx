import Input from '@material-ui/core/Input'
import Link from '@material-ui/core/Link'
import Popover from '@material-ui/core/Popover'
import { makeStyles } from '@material-ui/core/styles'
import {
  ArrowDropDownSharp,
  CheckSharp,
  PriorityHighSharp,
} from '@material-ui/icons'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraphicsRendererProcessKey } from '../../models/GraphicsRendererProcessKey'
import { AssetBaseRoute, ViewSubRoute } from '../models'
import { AnimationDevelopmentPageProps } from './AnimationDevelopmentPage'
import { ClientGraphicsRendererProcessPageProps } from './ClientGraphicsRendererProcessPage'

export interface AssetRouteSelectProps<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
> extends Pick<
      ClientGraphicsRendererProcessPageProps<
        SomeAssetBaseRoute,
        SomeViewSubRoute
      >,
      'assetBaseRoute'
    >,
    Pick<
      Parameters<
        AnimationDevelopmentPageProps<
          SomeAssetBaseRoute,
          SomeViewSubRoute
        >['SomeClientGraphicsRendererProcessPage']
      >[0],
      'cachedPollClientGraphicsRendererProcessStateResponseData'
    > {
  frameCount: number
}

export function AssetRouteSelect<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
>(props: AssetRouteSelectProps<SomeAssetBaseRoute, SomeViewSubRoute>) {
  const {
    assetBaseRoute,
    frameCount,
    cachedPollClientGraphicsRendererProcessStateResponseData,
  } = props
  const [assetRouteSearchQuery, setAssetRouteSearchQuery] = useState('')
  const assetRouteSelectMountedRef = useRef(false)
  const [selectingAssetRoute, setSelectingAssetRoute] = useState(false)
  const [selectedEmptyOptionsError, setSelectedEmptyOptionsError] =
    useState(false)
  const assetRouteBaseOptions = useMemo<GraphicsRendererProcessKey[]>(
    () => [
      'animation',
      ...new Array(frameCount)
        .fill(undefined)
        .map<GraphicsRendererProcessKey>(
          (_, someFrameIndex) => `frame/${someFrameIndex}`
        ),
    ],
    [frameCount]
  )
  const filteredAssetRouteOptions = useMemo(
    () =>
      assetRouteBaseOptions.filter((someAssetRouteBaseOption) =>
        someAssetRouteBaseOption.includes(assetRouteSearchQuery)
      ),
    [assetRouteSearchQuery, assetRouteBaseOptions]
  )
  const [focusedAssetRouteOptionIndex, setFocusedAssetRouteOptionIndex] =
    useState(0)
  useEffect(() => {
    setFocusedAssetRouteOptionIndex(0)
    setSelectedEmptyOptionsError(false)
  }, [filteredAssetRouteOptions])
  const targetAssetLabelRef = useRef<HTMLDivElement>(null)
  const optionsContainerRef = useRef<HTMLDivElement>(null)
  const focusedLinkRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const optionsContainerBoundingClientRect =
      optionsContainerRef.current?.getBoundingClientRect()
    const focusedLinkBoundingClientRect =
      focusedLinkRef.current?.getBoundingClientRect()
    if (
      optionsContainerBoundingClientRect &&
      focusedLinkBoundingClientRect &&
      (focusedLinkBoundingClientRect.bottom >
        optionsContainerBoundingClientRect.bottom ||
        focusedLinkBoundingClientRect.top <
          optionsContainerBoundingClientRect.top)
    ) {
      focusedLinkRef.current!.scrollIntoView()
    }
  }, [focusedAssetRouteOptionIndex])
  useEffect(() => {
    if (
      assetRouteSelectMountedRef.current === true &&
      selectingAssetRoute === false
    ) {
      targetAssetLabelRef.current?.focus()
    } else {
      assetRouteSelectMountedRef.current = true
    }
  }, [selectingAssetRoute])
  useEffect(() => {
    if (selectingAssetRoute === false) {
      setAssetRouteSearchQuery('')
    }
  }, [selectingAssetRoute])
  const navigateToRoute = useNavigate()
  const styles = useAssetRouteSelectStyles()
  return (
    <div>
      <div
        tabIndex={0}
        ref={targetAssetLabelRef}
        className={styles.selectedAssetRouteDisplay}
        onClick={() => {
          setSelectingAssetRoute(true)
        }}
        onKeyDown={(someKeyDownEvent) => {
          if (someKeyDownEvent.key === 'Enter') {
            setSelectingAssetRoute(true)
          }
        }}
      >
        {assetBaseRoute.slice(1)}
        <ArrowDropDownSharp />
      </div>
      <Popover
        tabIndex={-1}
        disableAutoFocus={true}
        disableEnforceFocus={true}
        disableRestoreFocus={true}
        transitionDuration={0}
        anchorEl={targetAssetLabelRef.current}
        open={selectingAssetRoute}
        PaperProps={{
          square: true,
          elevation: 3,
          style: {},
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={() => {
          setSelectingAssetRoute(false)
        }}
      >
        <div
          className={styles.dropdownContainer}
          onKeyDown={(someKeyDownEvent) => {
            switch (someKeyDownEvent.key) {
              case 'ArrowDown':
                if (
                  focusedAssetRouteOptionIndex <
                  filteredAssetRouteOptions.length - 1
                ) {
                  setFocusedAssetRouteOptionIndex(
                    focusedAssetRouteOptionIndex + 1
                  )
                }
                break
              case 'ArrowUp':
                if (focusedAssetRouteOptionIndex > 0) {
                  setFocusedAssetRouteOptionIndex(
                    focusedAssetRouteOptionIndex - 1
                  )
                }
                break
              case 'Enter':
                someKeyDownEvent.stopPropagation()
                const focusedAssetRouteOption =
                  filteredAssetRouteOptions[focusedAssetRouteOptionIndex]
                if (focusedAssetRouteOption !== undefined) {
                  const { targetGraphicsRendererProcessCompleted } =
                    getTargetGraphicsRendererProcessData({
                      cachedPollClientGraphicsRendererProcessStateResponseData,
                      someFilteredAssetRouteOption: focusedAssetRouteOption,
                    })
                  navigateToRoute(
                    `/${focusedAssetRouteOption}${
                      targetGraphicsRendererProcessCompleted
                        ? '/result'
                        : '/logs'
                    }`
                  )
                } else {
                  setSelectedEmptyOptionsError(true)
                }
                break
              case 'Tab':
                setSelectingAssetRoute(false)
                break
            }
          }}
        >
          <div className={styles.searchInputContainer}>
            <Input
              fullWidth={true}
              disableUnderline={true}
              autoFocus={true}
              placeholder={'select target asset'}
              value={assetRouteSearchQuery}
              onChange={(someChangeEvent) => {
                setAssetRouteSearchQuery(someChangeEvent.currentTarget.value)
              }}
            />
          </div>
          <div className={styles.searchInputDivider} />
          <div ref={optionsContainerRef} className={styles.optionsContainer}>
            {filteredAssetRouteOptions.length > 0 ? (
              filteredAssetRouteOptions.map(
                (
                  someFilteredAssetRouteOption,
                  filteredAssetRouteOptionIndex
                ) => {
                  const {
                    targetGraphicsRendererProcessCompleted,
                    cachedTargetGraphicsRendererProcessStatus,
                  } = getTargetGraphicsRendererProcessData({
                    cachedPollClientGraphicsRendererProcessStateResponseData,
                    someFilteredAssetRouteOption,
                  })
                  return (
                    <Link
                      ref={
                        filteredAssetRouteOptionIndex ===
                        focusedAssetRouteOptionIndex
                          ? focusedLinkRef
                          : null
                      }
                      key={someFilteredAssetRouteOption}
                      color={'secondary'}
                      className={`${styles.optionLink} ${
                        filteredAssetRouteOptionIndex ===
                        focusedAssetRouteOptionIndex
                          ? 'focused-option'
                          : ''
                      } ${
                        someFilteredAssetRouteOption === assetBaseRoute.slice(1)
                          ? 'current-option'
                          : ''
                      }`}
                      href={`/${someFilteredAssetRouteOption}${
                        targetGraphicsRendererProcessCompleted
                          ? '/result'
                          : '/logs'
                      }`}
                      onClick={() => {
                        navigateToRoute(
                          `/${someFilteredAssetRouteOption}${
                            targetGraphicsRendererProcessCompleted
                              ? '/result'
                              : '/logs'
                          }`
                        )
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                      <div>{someFilteredAssetRouteOption}</div>
                      {cachedTargetGraphicsRendererProcessStatus ===
                      'processSuccessful' ? (
                        <CheckSharp
                          className={
                            styles.cachedTargetGraphicsRendererProcessStatusIcon
                          }
                          color={'primary'}
                          fontSize={'small'}
                        />
                      ) : cachedTargetGraphicsRendererProcessStatus ===
                        'processFailed' ? (
                        <PriorityHighSharp
                          className={
                            styles.cachedTargetGraphicsRendererProcessStatusIcon
                          }
                          color={'error'}
                          fontSize={'small'}
                        />
                      ) : null}
                    </Link>
                  )
                }
              )
            ) : (
              <div
                className={`${styles.noOptionsDisplay} ${
                  selectedEmptyOptionsError ? styles.noOptionsDisplayError : ''
                }`}
                onClick={() => {
                  setSelectedEmptyOptionsError(true)
                }}
              >
                no options match
              </div>
            )}
          </div>
        </div>
      </Popover>
    </div>
  )
}

const useAssetRouteSelectStyles = makeStyles((theme) => ({
  selectedAssetRouteDisplay: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
    color: theme.palette.getContrastText(theme.palette.primary.main),
    '&:focus': {
      outlineColor: '#ede158',
      outlineStyle: 'solid',
      outlineWidth: theme.spacing(1 / 3),
    },
  },
  dropdownContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: theme.palette.primary.light,
  },
  searchInputContainer: {
    padding: theme.spacing(1),
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.5),
  },
  searchInputDivider: {
    margin: '0 -9999rem',
    height: 2,
    backgroundColor: theme.palette.primary.light,
  },
  optionsContainer: {
    flexBasis: 252,
    overflowY: 'scroll',
    display: 'flex',
    flexDirection: 'column',
  },
  optionLink: {
    padding: theme.spacing(1),
    paddingBottom: theme.spacing(1.25),
    color: theme.palette.secondary.main,
    fontWeight: 700,
    '&.focused-option': {
      backgroundColor: theme.palette.grey[100],
      textDecoration: 'underline',
      '& > div': {
        outlineColor: '#ede158',
        outlineStyle: 'solid',
        outlineWidth: theme.spacing(1 / 3),
      },
    },
    '&.current-option': {
      fontStyle: 'italic',
    },
    '&:focus': {
      outline: 'none',
    },
    '& > div': {
      flexGrow: 0,
      '&:active': {
        outlineColor: '#ede158',
        outlineStyle: 'solid',
        outlineWidth: theme.spacing(1 / 3),
      },
    },
  },
  noOptionsDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(1),
    fontStyle: 'italic',
    fontWeight: theme.typography.caption.fontWeight,
    color: theme.palette.text.hint,
  },
  noOptionsDisplayError: {
    color: theme.palette.error.main,
  },
  cachedTargetGraphicsRendererProcessStatusIcon: {
    marginLeft: theme.spacing(1),
  },
}))

interface GetTargetGraphicsRendererProcessDataApi<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
> extends Pick<
    AssetRouteSelectProps<SomeAssetBaseRoute, SomeViewSubRoute>,
    'cachedPollClientGraphicsRendererProcessStateResponseData'
  > {
  someFilteredAssetRouteOption: GraphicsRendererProcessKey
}

function getTargetGraphicsRendererProcessData<
  SomeAssetBaseRoute extends AssetBaseRoute,
  SomeViewSubRoute extends ViewSubRoute
>(
  api: GetTargetGraphicsRendererProcessDataApi<
    SomeAssetBaseRoute,
    SomeViewSubRoute
  >
) {
  const {
    cachedPollClientGraphicsRendererProcessStateResponseData,
    someFilteredAssetRouteOption,
  } = api
  const cachedTargetPollClientGraphicsRendererProcessStateResponse =
    cachedPollClientGraphicsRendererProcessStateResponseData
      ?.pollClientGraphicsRendererProcessStateResponseMap[
      someFilteredAssetRouteOption
    ] || null
  const cachedTargetGraphicsRendererProcessStatus =
    cachedTargetPollClientGraphicsRendererProcessStateResponse?.responseStatus ===
      'fetchSuccessful' &&
    cachedTargetPollClientGraphicsRendererProcessStateResponse
      .clientGraphicsRendererProcessState.buildStatus === 'validBuild' &&
    cachedTargetPollClientGraphicsRendererProcessStateResponse
      .clientGraphicsRendererProcessState.graphicsRendererProcessStatus
  const targetGraphicsRendererProcessCompleted =
    cachedTargetGraphicsRendererProcessStatus === 'processSuccessful' ||
    cachedTargetGraphicsRendererProcessStatus === 'processFailed'
  return {
    cachedTargetGraphicsRendererProcessStatus,
    targetGraphicsRendererProcessCompleted,
  }
}
