import { NAV_ITEMS, type NavItem } from "./portfolio-types";

export function PortfolioHeader({
  menuOpen,
  onMenuToggle,
  onNavigate,
}: {
  menuOpen: boolean;
  onMenuToggle: () => void;
  onNavigate: (item: NavItem) => void;
}) {
  return (
    <header className="portfolioHeader sticky top-0 z-10 col-span-full" role="banner">
      <nav className="portfolioNav flex items-center justify-center px-2 py-3.5 max-[650px]:p-2.5" aria-label="Primary">
        <div className="relative flex w-full items-center justify-center gap-[clamp(8px,1.4vw,22px)] max-[650px]:flex-nowrap max-[650px]:justify-between max-[650px]:gap-3">
          <div className="portfolioBrand flex min-w-[110px] flex-[0_0_clamp(135px,14vw,250px)] justify-center whitespace-nowrap px-[clamp(8px,1vw,14px)] py-2.5">
            <span>wild (42) {"{"}<br />&nbsp;&nbsp;&nbsp;&nbsp;media;<br />{"}"}</span>
          </div>

          <button
            type="button"
            className="menuToggle hidden h-16 w-16 flex-col items-center justify-center gap-[5px] p-0 max-[650px]:flex"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation-links"
            onClick={onMenuToggle}
          >
            {menuOpen ? (
              <span className="menuCloseIcon flex items-center justify-center" aria-hidden="true">✕</span>
            ) : (
              <>
                <span className="menuBar my-0.5 block h-[5px] w-10" />
                <span className="menuBar my-0.5 block h-[5px] w-10" />
                <span className="menuBar my-0.5 block h-[5px] w-10" />
              </>
            )}
          </button>

          <div
            id="primary-navigation-links"
            className={`portfolioNavLinks flex flex-[1_1_auto] items-center justify-center gap-[clamp(8px,1.4vw,22px)] max-[650px]:hidden ${menuOpen ? "isOpen" : ""}`}
          >
            <div className="flex flex-[1_1_auto] gap-[clamp(8px,1.4vw,22px)] max-[650px]:flex-col">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  type="button"
                  data-modal-target={item.toLowerCase()}
                  onClick={() => onNavigate(item)}
                  className="navLink flex h-full min-w-[100px] flex-[0_1_clamp(120px,12vw,250px)] items-center justify-center whitespace-nowrap px-[clamp(8px,1vw,14px)] py-2.5 max-[650px]:w-full max-[650px]:min-w-0 max-[650px]:px-3.5 max-[650px]:py-3"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
