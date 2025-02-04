import WhatshotIcon from '@mui/icons-material/Whatshot';
import { Link, styled, type LinkProps } from '@mui/material';

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

export const AppBarOffset = styled('div')(({ theme }) => theme.mixins.toolbar);
