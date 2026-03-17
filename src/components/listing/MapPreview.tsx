interface Props {
  mapLink: string;
}

export default function MapPreview({ mapLink }: Props) {
  return (
    <div className="rounded-xl overflow-hidden border">

      <iframe
        src={mapLink}
        width="100%"
        height="350"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

    </div>
  );
}