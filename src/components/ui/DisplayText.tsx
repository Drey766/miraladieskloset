/**
 * For content shown in the display face. Marcellus's old-style numerals read badly
 * (its 1 looks like an I, so "101" becomes "IOI"), so numbers are set in the body face.
 */
export default function DisplayText({ children }: { children: string }) {
  return (
    <>
      {children.split(/(\d+)/).map((part, index) =>
        /^\d+$/.test(part) ? (
          <span key={index} className="font-body">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
