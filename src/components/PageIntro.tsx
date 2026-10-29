

export function PageIntro({
  eyebrow,
  title,
  description,
  localLine,
}: {
  eyebrow: string;
  title: string;
  description: string;
  localLine?: string;
}) {
  return (
    <div className="page-intro container">
      <p className="eyebrow">
        <span />
        {eyebrow}
      </p>
      <h1>{title}</h1>
      {localLine && <p className="local-intro" lang="ml">{localLine}</p>}
      <p>{description}</p>
    </div>
  );
}
