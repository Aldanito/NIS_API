import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Slider,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Menu,
  MenuItem,
  LinearProgress,
  Tooltip,
  Fade,
  Divider,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  VolumeMute,
  Fullscreen,
  FullscreenExit,
  Replay10,
  Forward10,
  Speed,
  Favorite,
  Share,
  ErrorOutline
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const VideoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.common.black,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '&:hover .controls': {
    opacity: 1
  }
}));

const Controls = styled(Box)(({ theme, show }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
  opacity: show ? 1 : 0,
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.standard,
  }),
  zIndex: 1
}));

const KeyboardShortcuts = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  padding: theme.spacing(1, 2),
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  opacity: 0,
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.standard,
  }),
  '.video-wrapper:hover &': {
    opacity: 0.8
  }
}));

const VideoPlayer = ({ videoUrl, lesson, onProgress }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [anchorElSpeed, setAnchorElSpeed] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const progressThreshold = 0.9;
  const showSpeedMenu = Boolean(anchorElSpeed);

  const processedVideoUrl = useMemo(() => {
    if (!videoUrl) {
      console.log('Video URL is empty or undefined');
      return '';
    }

    let url = videoUrl;

    if (url.startsWith('http')) {
      console.log('Using absolute URL:', url);

      const filename = url.split('/').pop();

      if (filename && filename.includes('_')) {
        const originalUrl = url;

        const baseFilename = filename.split('_')[0];
        const extension = filename.split('.').pop();
        const fallbackFilename = `${baseFilename}.${extension}`;
        const fallbackUrl = url.replace(filename, fallbackFilename);

        console.log('Created fallback URL:', fallbackUrl);

        window.videoFallbackUrl = fallbackUrl;
      }

      return url;
    }

    const origin = window.location.origin;

    const cleanPath = url.startsWith('/') ? url : `/${url}`;

    const fullUrl = `${origin}${cleanPath}`;
    console.log('Constructed video URL:', fullUrl, 'from path:', url);

    return fullUrl;
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);

      if (video.currentTime > 0 &&
        video.duration > 0 &&
        (video.currentTime / video.duration) >= progressThreshold &&
        typeof onProgress === 'function') {
        onProgress(true);
      }
    };

    const updateDuration = () => {
      if (video.duration && video.duration !== Infinity) {
        setDuration(video.duration);
        setIsLoaded(true);
      }
    };

    const handleError = () => {
      setHasError(true);
      console.error("Video error occurred with source:", processedVideoUrl);
    };

    const handleLoaded = () => {
      setIsLoaded(true);
      setHasError(false);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('loadeddata', handleLoaded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('loadeddata', handleLoaded);
      video.removeEventListener('error', handleError);
    };
  }, [processedVideoUrl, onProgress, progressThreshold]);

  useEffect(() => {
    let timeoutId;
    if (showControls && isPlaying) {
      timeoutId = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [showControls, isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error("Error playing video:", error);
          setIsPlaying(false);
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleSeekChange = useCallback((e, newValue) => {
    if (!videoRef.current || !duration) return;

    const newTime = (newValue / 100) * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleVolumeChange = useCallback((e, newValue) => {
    const newVolume = newValue / 100;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      video.muted = false;
      if (volume === 0) {
        const newVolume = 0.5;
        video.volume = newVolume;
        setVolume(newVolume);
      } else {
        setVolume(video.volume);
      }
    } else {
      video.muted = true;
      setVolume(0);
    }
  }, [volume]);

  const handleSpeedMenuOpen = (event) => {
    setAnchorElSpeed(event.currentTarget);
  };

  const handleSpeedMenuClose = () => {
    setAnchorElSpeed(null);
  };

  const changePlaybackRate = useCallback((rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
    handleSpeedMenuClose();
  }, []);

  const toggleFullscreen = useCallback(() => {
    const videoContainer = videoRef.current.parentElement;

    if (!document.fullscreenElement) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  const skipTime = useCallback((seconds) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  }, [duration]);

  const formatTime = (time) => {
    if (!time || isNaN(time) || time === Infinity) return "0:00";

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  // Get correct volume icon based on volume level
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeOff />;
    if (volume < 0.5) return <VolumeMute />;
    return <VolumeUp />;
  };

  // Error display component using MUI
  const VideoError = () => (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.7)'
      }}
    >
      <ErrorOutline sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h6" color="white" gutterBottom>
        Не удалось загрузить видео
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setHasError(false);
          if (videoRef.current) {
            videoRef.current.load();
          }
        }}
        sx={{ mt: 2 }}
      >
        Попробовать снова
      </Button>
    </Box>
  );

  return (
    <Card elevation={3}>
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="h6" component="h2">
          {lesson && lesson.title ? lesson.title : 'Видео урок'}
        </Typography>
        {lesson && lesson.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {lesson.description}
          </Typography>
        )}
      </CardContent>

      <Box className="video-wrapper" sx={{ position: 'relative' }}>
        <VideoContainer
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => !isPlaying || setShowControls(false)}
        >
          <Box
            component="video"
            ref={videoRef}
            src={processedVideoUrl}
            sx={{ width: '100%', maxHeight: '70vh', display: 'block' }}
            onClick={togglePlay}
            crossOrigin="anonymous"
            playsInline
            onError={(e) => {
              console.error("Video error occurred:", e);
              setHasError(true);
            }}
            onKeyDown={(e) => {
              switch (e.key) {
                case ' ':
                case 'k':
                  e.preventDefault();
                  togglePlay();
                  break;
                case 'ArrowLeft':
                  e.preventDefault();
                  skipTime(-10);
                  break;
                case 'ArrowRight':
                  e.preventDefault();
                  skipTime(10);
                  break;
                case 'm':
                  e.preventDefault();
                  toggleMute();
                  break;
                case 'f':
                  e.preventDefault();
                  toggleFullscreen();
                  break;
              }
            }}
            tabIndex={0}
          />

          {/* Loading Overlay */}
          {!isLoaded && !hasError && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.5)'
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}

          {/* Error Overlay */}
          {hasError && <VideoError />}

          {/* Play Button Overlay */}
          <Fade in={!isPlaying && !hasError && duration > 0}>
            <Box
              onClick={togglePlay}
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.3)',
                cursor: 'pointer'
              }}
            >
              <IconButton
                size="large"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                  transition: 'all 0.2s',
                  p: 2
                }}
                onClick={togglePlay}
              >
                <PlayArrow fontSize="large" />
              </IconButton>
            </Box>
          </Fade>

          {/* Controls */}
          <Controls className="controls" show={showControls}>
            <Box mb={1}>
              <Slider
                value={progressPercent}
                onChange={handleSeekChange}
                aria-label="Video progress"
                sx={{
                  color: 'primary.main',
                  height: 4,
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                    transition: '0.3s',
                    '&:hover, &.Mui-active': {
                      boxShadow: '0 0 0 10px rgba(25, 118, 210, 0.16)',
                    },
                  },
                  '&:hover .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                  },
                  '&:hover': {
                    height: 6,
                  }
                }}
              />
            </Box>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                {/* Play/Pause */}
                <IconButton
                  onClick={togglePlay}
                  color="inherit"
                  sx={{ color: 'white' }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause /> : <PlayArrow />}
                </IconButton>

                {/* Skip back 10s */}
                <IconButton
                  onClick={() => skipTime(-10)}
                  sx={{ color: 'white' }}
                  aria-label="Rewind 10 seconds"
                >
                  <Replay10 />
                </IconButton>

                {/* Skip forward 10s */}
                <IconButton
                  onClick={() => skipTime(10)}
                  sx={{ color: 'white' }}
                  aria-label="Forward 10 seconds"
                >
                  <Forward10 />
                </IconButton>

                {/* Volume */}
                <Box sx={{ position: 'relative' }} onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
                  <IconButton
                    onClick={toggleMute}
                    sx={{ color: 'white' }}
                    aria-label={volume === 0 ? "Unmute" : "Mute"}
                  >
                    <VolumeIcon />
                  </IconButton>

                  <Fade in={showVolumeSlider}>
                    <Paper
                      sx={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 0,
                        width: 120,
                        p: 1,
                        mb: 1,
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                      }}
                    >
                      <Slider
                        value={volume * 100}
                        onChange={handleVolumeChange}
                        aria-label="Volume"
                        sx={{ color: 'primary.main' }}
                      />
                    </Paper>
                  </Fade>
                </Box>

                {/* Time display */}
                <Typography variant="body2" sx={{ color: 'white', ml: 1 }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                {/* Playback speed */}
                <Button
                  variant="text"
                  size="small"
                  onClick={handleSpeedMenuOpen}
                  sx={{ color: 'white', minWidth: 'auto' }}
                  startIcon={<Speed />}
                >
                  {playbackRate}x
                </Button>
                <Menu
                  anchorEl={anchorElSpeed}
                  open={showSpeedMenu}
                  onClose={handleSpeedMenuClose}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                    <MenuItem
                      key={rate}
                      onClick={() => changePlaybackRate(rate)}
                      selected={playbackRate === rate}
                      dense
                    >
                      {rate}x
                    </MenuItem>
                  ))}
                </Menu>

                {/* Fullscreen toggle */}
                <IconButton
                  onClick={toggleFullscreen}
                  sx={{ color: 'white' }}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Stack>
            </Stack>
          </Controls>

          {/* Keyboard shortcuts tooltip */}
          <KeyboardShortcuts>
            <Typography variant="caption" component="div">Space / K: Play/Pause</Typography>
            <Typography variant="caption" component="div">← →: Skip 10s</Typography>
            <Typography variant="caption" component="div">M: Mute</Typography>
            <Typography variant="caption" component="div">F: Fullscreen</Typography>
          </KeyboardShortcuts>
        </VideoContainer>
      </Box>

      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Прогресс: {Math.round(progressPercent)}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{ mt: 0.5, mb: 1, height: 6, borderRadius: 1 }}
            />
            {lesson?.duration && (
              <Typography variant="body2" color="text.secondary">
                Длительность: {lesson.duration}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              startIcon={<Favorite />}
              size="small"
              color="primary"
              variant="text"
            >
              Нравится
            </Button>
            <Button
              startIcon={<Share />}
              size="small"
              color="primary"
              variant="text"
            >
              Поделиться
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
