import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  type RadioGroupProps,
  type TextFieldProps,
} from '@mui/material';
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type PathValue,
} from 'react-hook-form';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { useState } from 'react';
import type { AdCampaign_Client } from '@shared/campaign';
import { CalendarMonth } from '@mui/icons-material';

export const RHFTextField = <T extends FieldValues, P extends Path<T>>({
  control,
  name,
  ...inputProps
}: {
  control: Control<T>;
  name: P;
} & TextFieldProps) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { ref: _, ...register } }) => (
      <TextField {...inputProps} {...register} />
    )}
  />
);

export const RHFSelect = <T extends FieldValues, P extends Path<T>>({
  control,
  name,
  labelText,
  labelId,
  items,
  onChange,
  required,
}: {
  control: Control<T>;
  name: P;
  labelText: string;
  labelId: string;
  items: Record<string, PathValue<T, P>>;
  onChange?: () => void;
  required?: boolean;
}) => (
  <FormControl required={required}>
    <InputLabel id={labelId}>{labelText}</InputLabel>
    <Controller
      control={control}
      name={name}
      render={({
        field: { ref: _, onChange: controlOnChange, ...register },
      }) => (
        <Select
          onChange={(e) => {
            controlOnChange(e);
            onChange?.();
          }}
          {...register}
          labelId={labelId}
          label={labelText}
        >
          {Object.entries(items).map(([itemName, val]) => (
            <MenuItem key={val} value={val}>
              {itemName}
            </MenuItem>
          ))}
        </Select>
      )}
    />
  </FormControl>
);

export const RadioGroupControl = ({
  disabled,
  labels,
  text,
  ...props
}: RadioGroupProps & {
  disabled?: boolean;
  labels: [string, string][] | Record<string, string>;
  text?: string;
}) => (
  <FormControl
    disabled={disabled}
    sx={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
  >
    {text && <FormLabel>{text}</FormLabel>}
    <RadioGroup {...props}>
      {(Array.isArray(labels) ? labels : Object.entries(labels)).map(
        ([value, label]) => (
          <FormControlLabel
            key={value}
            value={value}
            label={label}
            control={<Radio />}
          />
        )
      )}
    </RadioGroup>
  </FormControl>
);

export function DateRangePicker({
  range,
  setRange,
}: {
  range: AdCampaign_Client['dateRange'];
  setRange: (dateRange: AdCampaign_Client['dateRange']) => void;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <TextField
        name="startDate"
        variant="outlined"
        type="text"
        label="开始日期"
        value={range.from ? range.from : 'yyyy-mm-dd'}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <CalendarMonth />
            </InputAdornment>
          ),
        }}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
      />
      <Typography component="span">至</Typography>
      <TextField
        name="endDate"
        variant="outlined"
        type="text"
        label="结束日期"
        value={range.to ? range.to : 'yyyy-mm-dd'}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <CalendarMonth />
            </InputAdornment>
          ),
        }}
        onClick={() => setOpen(true)}
      />

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>选择投放日期范围</DialogTitle>
        <DialogContent sx={{ minHeight: 365 }}>
          <DayPicker
            mode="range"
            disabled={(date) => date < today}
            selected={
              range.from && range.to
                ? {
                    from: new Date(range.from),
                    to: new Date(range.to),
                  }
                : { from: undefined, to: undefined }
            }
            onSelect={(range) => {
              range &&
                range.from &&
                range.to &&
                setRange({
                  from: formatDate(range.from),
                  to: formatDate(range.to),
                });
            }}
          />
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${month}-${day}`;
};
