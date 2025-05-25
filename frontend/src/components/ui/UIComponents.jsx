import React, { memo } from 'react';
import {
    Button as MuiButton,
    TextField,
    MenuItem,
    CircularProgress,
    Card as MuiCard,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert as MuiAlert,
    Tabs as MuiTabs,
    Tab,
    Box,
    IconButton,
    FormHelperText,
    FormControl,
    InputLabel,
    Select as MuiSelect
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const Button = memo(({
    children,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    onClick,
    type = 'button',
    className = '',
    icon = null,
    fullWidth = false,
    ariaLabel,
    ...props
}) => {
    const variantMap = {
        primary: 'contained',
        secondary: 'outlined',
        success: 'contained',
        warning: 'contained',
        danger: 'contained',
        ghost: 'text',
        coursera: 'contained'
    };

    const colorMap = {
        primary: 'primary',
        secondary: 'primary',
        success: 'success',
        warning: 'warning',
        danger: 'error',
        ghost: 'inherit',
        coursera: 'primary'
    };

    return (
        <MuiButton
            variant={variantMap[variant]}
            color={colorMap[variant]}
            size={size}
            disabled={disabled || loading}
            onClick={onClick}
            type={type}
            fullWidth={fullWidth}
            aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : icon}
            className={className}
            {...props}
        >
            {children}
        </MuiButton>
    );
});


export const Input = memo(({
    id,
    label,
    error,
    required = false,
    className = '',
    icon = null,
    helpText = '',
    ...props
}) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <TextField
            id={inputId}
            label={label}
            error={!!error}
            helperText={error || helpText}
            required={required}
            className={className}
            fullWidth
            InputProps={{
                startAdornment: icon && <Box mr={1}>{icon}</Box>
            }}
            {...props}
        />
    );
});


export const Select = memo(({
    id,
    label,
    error,
    options = [],
    required = false,
    className = '',
    helpText = '',
    ...props
}) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <FormControl fullWidth error={!!error} required={required} className={className}>
            <InputLabel id={`${selectId}-label`}>{label}</InputLabel>
            <MuiSelect
                labelId={`${selectId}-label`}
                id={selectId}
                label={label}
                {...props}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </MuiSelect>
            {(helpText || error) && (
                <FormHelperText>{error || helpText}</FormHelperText>
            )}
        </FormControl>
    );
});


export const LoadingSpinner = ({ size = 'medium', className = '', text = '' }) => {
    const sizeMap = {
        small: 24,
        medium: 40,
        large: 60
    };

    return (
        <Box className={className} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <CircularProgress size={sizeMap[size]} />
            {text && <Box mt={2} fontSize="sm" color="text.secondary">{text}</Box>}
        </Box>
    );
};


export const Card = ({
    children,
    className = '',
    hover = false,
    padding = 'normal',
    shadow = 'medium',
    ...props
}) => {
    const paddingMap = {
        none: 0,
        small: 2,
        normal: 3,
        large: 4
    };

    const elevationMap = {
        none: 0,
        small: 1,
        medium: 2,
        large: 4
    };

    return (
        <MuiCard
            className={className}
            elevation={elevationMap[shadow]}
            sx={{
                transition: 'all 0.2s',
                ...(hover && {
                    '&:hover': {
                        boxShadow: 6,
                        borderColor: 'primary.main'
                    }
                })
            }}
            {...props}
        >
            <CardContent sx={{ padding: paddingMap[padding] }}>
                {children}
            </CardContent>
        </MuiCard>
    );
};


export const Badge = ({
    children,
    variant = 'default',
    size = 'medium',
    className = ''
}) => {
    const colorMap = {
        default: 'default',
        success: 'success',
        warning: 'warning',
        danger: 'error',
        info: 'info',
        coursera: 'primary'
    };

    const sizeMap = {
        small: 'small',
        medium: 'medium',
        large: 'medium'
    };

    return (
        <Chip
            label={children}
            color={colorMap[variant]}
            size={sizeMap[size]}
            className={className}
            variant={variant === 'default' ? 'outlined' : 'filled'}
        />
    );
};


export const Modal = memo(({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    className = '',
    footer = null,
}) => {
    const sizeMap = {
        small: 'sm',
        medium: 'md',
        large: 'lg',
        xlarge: 'xl'
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth={sizeMap[size]}
            fullWidth
            className={className}
            aria-labelledby={title ? 'dialog-title' : undefined}
        >
            {title && (
                <DialogTitle id="dialog-title" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {title}
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        size="small"
                        sx={{ ml: 2 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
            )}
            <DialogContent dividers>
                {children}
            </DialogContent>
            {footer && (
                <DialogActions sx={{ padding: 2, bgcolor: 'background.default' }}>
                    {footer}
                </DialogActions>
            )}
        </Dialog>
    );
});


export const Alert = memo(({
    children,
    type = 'info',
    onClose,
    className = '',
    title = '',
}) => {
    const severityMap = {
        success: 'success',
        warning: 'warning',
        error: 'error',
        info: 'info'
    };

    return (
        <MuiAlert
            severity={severityMap[type]}
            onClose={onClose}
            className={className}
            sx={{ mb: 2 }}
        >
            {title && <MuiAlert.Title>{title}</MuiAlert.Title>}
            {children}
        </MuiAlert>
    );
});


export const Tabs = memo(({
    tabs = [],
    activeTab,
    onChange,
    className = '',
    variant = 'underline',
    ariaLabel = 'Navigation tabs'
}) => {
    const variantMap = {
        underline: 'standard',
        pills: 'scrollable',
        buttons: 'fullWidth'
    };

    const handleChange = (_, newValue) => {
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <Box className={className}>
            <MuiTabs
                value={activeTab}
                onChange={handleChange}
                variant={variantMap[variant]}
                aria-label={ariaLabel}
                scrollButtons="auto"
                allowScrollButtonsMobile
            >
                {tabs.map((tab) => (
                    <Tab
                        key={tab.id}
                        label={tab.label}
                        id={`tab-${tab.id}`}
                        aria-controls={`tabpanel-${tab.id}`}
                    />
                ))}
            </MuiTabs>
        </Box>
    );
});