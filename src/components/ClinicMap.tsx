import { useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiIsLoaded,
  useApiLoadingStatus,
  APILoadingStatus,
} from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin } from 'lucide-react';
import { CLINIC_INFO } from '../lib/clinicInfo';

function ClinicMapCanvas() {
  const isLoaded = useApiIsLoaded();
  const loadingStatus = useApiLoadingStatus();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoOpen, setInfoOpen] = useState(true);

  if (
    loadingStatus === APILoadingStatus.FAILED ||
    loadingStatus === APILoadingStatus.AUTH_FAILURE
  ) {
    return <MapFallbackCard />;
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[360px] rounded-xl border border-[#83A99A]/30 bg-[#DCEFE7]/40 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-6 h-6 text-[#174B43] mb-2 animate-pulse" />
        <p className="text-sm font-medium text-[#174B43]">
          Chargement de la carte de localisation…
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[360px] rounded-xl overflow-hidden border border-[#83A99A]/30 bg-white">
      <GoogleMap
        defaultCenter={{
          lat: CLINIC_INFO.latitude,
          lng: CLINIC_INFO.longitude,
        }}
        defaultZoom={15}
        mapId="DEMO_MAP_ID"
        gestureHandling="cooperative"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
      >
        <AdvancedMarker
          ref={markerRef}
          position={{
            lat: CLINIC_INFO.latitude,
            lng: CLINIC_INFO.longitude,
          }}
          onClick={() => setInfoOpen(true)}
          title={`${CLINIC_INFO.name} — ${CLINIC_INFO.address}`}
        >
          <Pin
            background="#174B43"
            borderColor="#0F352F"
            glyphColor="#FFFFFF"
            scale={1.15}
          />
        </AdvancedMarker>
        {infoOpen && marker && (
          <InfoWindow
            anchor={marker}
            maxWidth={260}
            onCloseClick={() => setInfoOpen(false)}
          >
            <div className="p-1 text-[#233B4A]">
              <p className="font-semibold text-sm text-[#174B43]">
                {CLINIC_INFO.name}
              </p>
              <p className="text-xs text-[#233B4A]/80 mt-0.5 leading-snug">
                {CLINIC_INFO.address}
                <br />
                Repère : {CLINIC_INFO.landmark}
              </p>
              <a
                href={CLINIC_INFO.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#174B43] underline mt-2"
              >
                Itinéraire Google Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

function MapFallbackCard() {
  return (
    <div className="w-full h-[360px] rounded-xl border border-[#83A99A]/35 bg-[#F5F8F6] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-[#DCEFE7] text-[#174B43] flex items-center justify-center mb-4">
        <MapPin className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-[#174B43]">
        {CLINIC_INFO.name} — Agoè Démakpoé
      </h3>
      <p className="text-sm text-[#233B4A]/80 mt-2 max-w-sm leading-relaxed">
        {CLINIC_INFO.address}.
        <br />
        Repère : {CLINIC_INFO.landmark}.
      </p>
      <a
        href={CLINIC_INFO.directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#174B43] text-white text-sm font-medium hover:bg-[#123c35] transition-colors"
      >
        Ouvrir la position sur Google Maps
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

export function ClinicMap({ apiKey }: { apiKey: string }) {
  if (!apiKey) {
    return <MapFallbackCard />;
  }

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={['marker']}
      language="fr"
      region="TG"
    >
      <ClinicMapCanvas />
    </APIProvider>
  );
}
