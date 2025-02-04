import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
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
}: {
  control: Control<T>;
  name: P;
  labelText: string;
  labelId: string;
  items: Record<string, PathValue<T, P>>;
}) => (
  <FormControl>
    <InputLabel id={labelId}>{labelText}</InputLabel>
    <Controller
      control={control}
      name={name}
      render={({ field: { ref: _, ...register } }) => (
        <Select {...register} labelId={labelId} label={labelText}>
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
