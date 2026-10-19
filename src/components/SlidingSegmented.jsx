import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

export default function SlidingSegmented({
  options = [],
  value,
  onChange,
  dataTour,
  ariaLabel = 'Choose an option',
  size = 'compact',
  fullWidth = false,
}) {
  const containerRef = useRef(null)
  const buttonRefs = useRef({})

  const [indicator, setIndicator] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    visible: false,
  })

  const isCompact = size === 'compact'

  const updateIndicator = () => {
    const container = containerRef.current
    const selectedButton =
      buttonRefs.current[value]

    if (!container || !selectedButton) {
      setIndicator((current) => ({
        ...current,
        visible: false,
      }))
      return
    }

    const containerRect =
      container.getBoundingClientRect()

    const buttonRect =
      selectedButton.getBoundingClientRect()

    setIndicator({
      left:
        buttonRect.left -
        containerRect.left,
      top:
        buttonRect.top -
        containerRect.top,
      width: buttonRect.width,
      height: buttonRect.height,
      visible: true,
    })
  }

  useLayoutEffect(() => {
    updateIndicator()
  }, [value, options.length])

  useEffect(() => {
    const handleResize = () => {
      updateIndicator()
    }

    window.addEventListener(
      'resize',
      handleResize,
    )

    return () => {
      window.removeEventListener(
        'resize',
        handleResize,
      )
    }
  }, [value, options.length])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return undefined
    }

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateIndicator)
        : null

    resizeObserver?.observe(container)

    return () => {
      resizeObserver?.disconnect()
    }
  }, [value, options.length])

  return (
    <Box
      ref={containerRef}
      data-tour={dataTour}
      role="tablist"
      aria-label={ariaLabel}
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: isCompact ? 0.35 : 0.4,
        p: isCompact ? 0.35 : 0.4,
        borderRadius: '12px',
        bgcolor: '#f5f7fa',
        minWidth: 0,
        width: fullWidth ? '100%' : 'fit-content',
        maxWidth: '100%',
        overflowX: 'auto',
        flexShrink: 1,

        '&::-webkit-scrollbar': {
          display: 'none',
        },

        scrollbarWidth: 'none',
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          top: indicator.top,
          left: 0,
          width: indicator.width,
          height: indicator.height,
          borderRadius: '8px',
          bgcolor: '#0967B2',
          boxShadow:
            '0 2px 7px rgba(13, 104, 201, 0.22)',
          transform: `translateX(${indicator.left}px)`,
          transition:
            'transform 220ms cubic-bezier(0.4, 0, 0.2, 1), width 180ms ease, height 180ms ease',
          opacity: indicator.visible ? 1 : 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {options.map((option) => {
        const optionValue =
          typeof option === 'string'
            ? option
            : option.value

        const label =
          typeof option === 'string'
            ? option
            : option.label

        const selected =
          value === optionValue

        return (
          <Button
            key={optionValue}
            ref={(node) => {
              if (node) {
                buttonRefs.current[
                  optionValue
                ] = node
              } else {
                delete buttonRefs.current[
                  optionValue
                ]
              }
            }}
            role="tab"
            aria-selected={selected}
            disableRipple
            onClick={() =>
              onChange?.(optionValue)
            }
            sx={{
              position: 'relative',
              zIndex: 1,
              minWidth: 'auto',
              width: fullWidth
                ? `${100 / options.length}%`
                : 'auto',
              height: isCompact ? 30 : 38,
              px: isCompact ? 1.25 : 1.5,
              py: 0,
              flexShrink: 0,
              border: 'none',
              borderRadius: '8px',
              textTransform: 'none',
              whiteSpace: 'nowrap',
              fontSize: isCompact
                ? '0.75rem'
                : '0.82rem',
              fontWeight: selected ? 600 : 500,
              color: selected
                ? '#fff'
                : '#52657d',
              bgcolor: 'transparent',
              transition:
                'color 180ms ease, font-weight 180ms ease',
              '&:hover': {
                bgcolor: 'transparent',
                color: selected
                  ? '#fff'
                  : '#243b5a',
              },
              '&:focus': {
                bgcolor: 'transparent',
              },
              '&:focus-visible': {
                outline:
                  '2px solid rgba(13, 104, 201, 0.35)',
                outlineOffset: 1,
              },
            }}
          >
            {label}
          </Button>
        )
      })}
    </Box>
  )
}