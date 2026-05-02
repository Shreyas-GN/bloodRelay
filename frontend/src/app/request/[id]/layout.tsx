import { Metadata } from 'next';
import { RequestService } from '@/services/request.service';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  try {
    const request = await RequestService.getRequestById(params.id);
    
    if (!request) return { title: 'Request Not Found' };

    const title = `Urgent ${request.blood_group} Blood Required at ${request.hospital_name}`;
    const description = `Immediate help needed for ${request.patient_name || 'a patient'}. ${request.units} units of ${request.blood_group} required. Location: ${request.hospital_name}, ${request.city}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: request.created_at,
        authors: ['PulseAid'],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      }
    };
  } catch (error) {
    return {
      title: 'Emergency Blood Request | PulseAid',
    };
  }
}

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
