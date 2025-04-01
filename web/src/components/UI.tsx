import WhatshotIcon from '@mui/icons-material/Whatshot';
import {
  Box,
  DialogTitle,
  Dialog,
  Link,
  styled,
  Typography,
  type LinkProps,
  DialogActions,
  Button,
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useNavigate } from 'react-router-dom';

export const TitleLabel = ({ mr, top }: { mr?: string; top?: string }) => (
  <>
    <WhatshotIcon
      sx={{
        fontSize: '1em',
        verticalAlign: 'middle',
        position: 'relative',
        mr,
        top,
      }}
    />
    萤火平台
  </>
);

export const FakeLink = ({
  variant,
  sx,
  children,
}: Pick<LinkProps, 'variant' | 'sx' | 'children'>) => (
  <Link
    href="#"
    underline="hover"
    variant={variant}
    sx={{ color: 'inherit', ...sx }}
  >
    {children}
  </Link>
);

export const GoBack = ({ onClick }: { onClick?: () => void }) => {
  const navigate = useNavigate();

  return (
    <Typography sx={{ mb: 2, fontWeight: 'bold' }}>
      <Box
        component="a"
        sx={{ cursor: 'pointer' }}
        onClick={onClick ?? (() => navigate(-1))}
      >
        <ArrowBackIosIcon
          sx={{ fontSize: 'inherit', verticalAlign: 'text-bottom' }}
        />
        返回
      </Box>
    </Typography>
  );
};

export const AppBarOffset = styled('div')(({ theme }) => theme.mixins.toolbar);

export function ConfirmDialog({
  open,
  title,
  disabled,
  handleConfirm,
  handleClose,
}: {
  open: boolean;
  title: string;
  disabled: boolean;
  handleConfirm: () => void;
  handleClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={handleClose} scroll="paper">
      <DialogTitle>{title}</DialogTitle>
      <DialogActions>
        <Button disabled={disabled} onClick={handleClose}>
          取消
        </Button>
        <Button disabled={disabled} onClick={handleConfirm}>
          确认
        </Button>
      </DialogActions>
    </Dialog>
  );
}
