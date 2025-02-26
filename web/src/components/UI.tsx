import WhatshotIcon from '@mui/icons-material/Whatshot';
import { Box, Link, styled, Typography, type LinkProps } from '@mui/material';
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
