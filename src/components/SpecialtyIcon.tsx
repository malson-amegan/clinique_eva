import {
  Activity,
  Baby,
  FlaskConical,
  HeartHandshake,
  ScanLine,
  Stethoscope,
} from 'lucide-react';

export function SpecialtyIcon({
  name,
  className = 'w-5 h-5',
}: {
  name: string;
  className?: string;
}) {
  switch (name) {
    case 'Activity':
      return <Activity className={className} />;
    case 'HeartHandshake':
      return <HeartHandshake className={className} />;
    case 'Baby':
      return <Baby className={className} />;
    case 'FlaskConical':
      return <FlaskConical className={className} />;
    case 'ScanLine':
      return <ScanLine className={className} />;
    default:
      return <Stethoscope className={className} />;
  }
}
