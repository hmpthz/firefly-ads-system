import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from '@mui/material';
import Selectable, { useSelectable } from 'react-selectable-box';

export function SelectableTimeTable({
  timeRange,
  setTimeRange,
}: {
  timeRange: string[];
  setTimeRange?: (cb: (timeRange: string[]) => string[]) => void;
}) {
  // 生成小时数组 (00:00 - 23:00)
  const hours = Array.from(
    { length: 24 },
    (_, i) => `${String(i).padStart(2, '0')}:00`
  );
  // 生成星期数组
  const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  return (
    <Selectable
      disabled={!setTimeRange}
      mode="reverse"
      selectStartRange="all"
      value={timeRange}
      dragContainer={() => document.getElementById('time-table')!}
      onEnd={(_selectingValue, { added, removed }) => {
        setTimeRange?.((prev) =>
          prev.concat(added).filter((i) => !removed.includes(i))
        );
      }}
    >
      <TableContainer>
        <Table
          id="time-table"
          sx={{
            maxWidth: 600,
            '&.MuiTable-root': {
              borderCollapse: 'separate',
            },
            '& .MuiTableCell-head': {
              padding: '6px',
            },
            '& .MuiTableCell-body': {
              padding: 0,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 'bold',
                  border: 'none',
                }}
              ></TableCell>
              {weekDays.map((day) => (
                <TableCell key={day} sx={{ fontWeight: 'bold' }}>
                  {day}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {hours.map((hourText, hour) => (
              <TableRow key={hourText} sx={{ position: 'relative' }}>
                <TableCell
                  sx={({ palette }) => ({
                    color: palette.grey[600],
                    border: 'none',
                    position: 'relative',
                    width: '60px',
                  })}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      right: '8px',
                      top: '-10px',
                      backgroundColor: 'common.white',
                    }}
                  >
                    {hour % 4 == 2 ? hourText : null}
                  </Box>
                </TableCell>
                {weekDays.map((_dayText, day) => (
                  <TimeSlot key={`${day}-${hour}`} value={`${day}-${hour}`} />
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Selectable>
  );
}

function TimeSlot({ value }: { value: string }) {
  const { setNodeRef, isSelected, isAdding, isRemoving } = useSelectable({
    value,
    rule: 'collision',
  });

  return (
    <TableCell
      ref={setNodeRef}
      sx={({ palette }) => ({
        height: '30px',
        border: `1px solid ${
          isSelected || isAdding ? palette.primary.main : palette.grey[300]
        }`,
        bgcolor: isRemoving
          ? palette.primary.main
          : isSelected
          ? palette.primary.light
          : 'transparent',
      })}
    />
  );
}
