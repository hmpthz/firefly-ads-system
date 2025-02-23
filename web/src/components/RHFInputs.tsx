import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
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
  ...props
}: RadioGroupProps & {
  disabled?: boolean;
  labels: [string, string][] | Record<string, string>;
}) => (
  <FormControl disabled={disabled}>
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
