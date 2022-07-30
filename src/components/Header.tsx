import { Component } from "solid-js";

interface IHeader {
  blockchainName: string;
}

export const Header: Component<IHeader> = (props: IHeader) => (
  <div>
    <div>
      <a href="https://devoleum.com/" target="_blank" rel="noopener noreferrer">
        Devoleum
      </a>{" "}
      is a{" "}
      <a
        href="https://github.com/Devoleum"
        target="_blank"
        rel="noopener noreferrer"
      >
        open source
      </a>{" "}
      web app that organizes linked open data from physical or digital supply
      chains into authentic stories notarized on various blockchains. Here you
      can verify the stories showed on our platform notarized on Polygon and
      Rinkeby, now you are on {props.blockchainName}. If you want to use another
      network please switch network on Metamask.
    </div>
    <br />
    <div class="donate_box">
      Donate to
      <br />
      ETH: 0xbf8d0d4be61De94EFCCEffbe5D414f911F11cBF8
      <br />
      ALGO: 5N22O3PIXAGNAGHBFSU6HQ22KGI4D3XEBACEFODVH3UOKCA4C2IBRD4ZDE
    </div>
    <br />
  </div>
);
