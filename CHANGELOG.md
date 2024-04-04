## [1.29.2](https://github.com/resourge/fetch/compare/v1.29.1...v1.29.2) (2024-04-04)


### Bug Fixes

* **notificationservice:** remove fetchData on useFetch unmount ([db8d9f5](https://github.com/resourge/fetch/commit/db8d9f50c1aac2b65a3ff24a2d4854d57931905d))

## [1.29.1](https://github.com/resourge/fetch/compare/v1.29.0...v1.29.1) (2024-04-03)


### Performance Improvements

* **usefetch:** simplify code, change to use useSyncExternalStoreWithS lector to work better with id ([072f96a](https://github.com/resourge/fetch/commit/072f96aaf98501eb9fa8a68c03e7a5a4b491811c))

# [1.29.0](https://github.com/resourge/fetch/compare/v1.28.1...v1.29.0) (2024-04-03)


### Features

* **usefetch:** clear and improve code, and automate the use of LoadingService/isLoading and errors ([4bae799](https://github.com/resourge/fetch/commit/4bae799311934abfc408fde133230ee176d3f986))


### Performance Improvements

* **usefetch:** improve fetch function ([9aef2a0](https://github.com/resourge/fetch/commit/9aef2a04630a21d8f42cb0255bd880150d6bf3ce))

## [1.28.1](https://github.com/resourge/fetch/compare/v1.28.0...v1.28.1) (2024-04-02)


### Bug Fixes

* **usefetch:** make useFetch with initialState have data not undefined ([ae3344d](https://github.com/resourge/fetch/commit/ae3344da92095607af9cbfb88ec50dc7000c3523))

# [1.28.0](https://github.com/resourge/fetch/compare/v1.27.0...v1.28.0) (2024-04-02)


### Features

* **usefetch:** add the current state to the method inserted in useFetch ([0332a23](https://github.com/resourge/fetch/commit/0332a23dc4789e477b1b18bf8c551ec72e704529))

# [1.27.0](https://github.com/resourge/fetch/compare/v1.26.0...v1.27.0) (2024-04-02)


### Features

* **usefetch:** add ability to change useFetch id ([e77dd35](https://github.com/resourge/fetch/commit/e77dd355d6c9c676144fc64aa5a85c31180e5037))

# [1.26.0](https://github.com/resourge/fetch/compare/v1.25.6...v1.26.0) (2024-04-01)


### Bug Fixes

* **basehttpservice:** small fix and tweaks ([372c43e](https://github.com/resourge/fetch/commit/372c43e7ca31f1207579fd822f71ad3854ea6622))
* **getcachekey:** add headers to cache key for get method ([f0a5012](https://github.com/resourge/fetch/commit/f0a5012cfe8bc89a58769c2dcd01c161415e4b81))


### Features

* **usefetch:** add some functions to add functionality ([2c772cd](https://github.com/resourge/fetch/commit/2c772cd80b4b3e38edf79e0ea10e8b2268922044))
* **useisonline:** add useIsOnline for react and react-native ([4ca7bea](https://github.com/resourge/fetch/commit/4ca7bea90094b66b286ec02ed1b5e1589748c52e))

## [1.25.6](https://github.com/resourge/fetch/compare/v1.25.5...v1.25.6) (2024-04-01)


### Bug Fixes

* **normalizeheaders:** react-native add condition to ReadableStream ([c96d0c3](https://github.com/resourge/fetch/commit/c96d0c32e724cddb2d1791929db6462f82b8d246))

## [1.25.5](https://github.com/resourge/fetch/compare/v1.25.4...v1.25.5) (2024-03-15)


### Bug Fixes

* **basehttpservice:** add .location to validation ([e532cfa](https://github.com/resourge/fetch/commit/e532cfa34b9d32d7ca9ff09ce8d2cf25816d9826))

## [1.25.4](https://github.com/resourge/fetch/compare/v1.25.3...v1.25.4) (2024-03-15)


### Bug Fixes

* **react-native:** fix useFetch not working on react-native ([45e1c81](https://github.com/resourge/fetch/commit/45e1c81372fc7acf6569e6b6b14d5a60aee84543))

## [1.25.3](https://github.com/resourge/fetch/compare/v1.25.2...v1.25.3) (2024-02-06)


### Bug Fixes

* **react-fetch:** fix build ([4560989](https://github.com/resourge/fetch/commit/4560989474584429c3ab7b9fb4e71f8a4c3c0b88))

## [1.25.2](https://github.com/resourge/fetch/compare/v1.25.1...v1.25.2) (2024-01-23)


### Bug Fixes

* **upload method for formdatakey:** added custom formdatakey for upload request ([f31a938](https://github.com/resourge/fetch/commit/f31a9385f80e33512f7a14eb99a27948de1266e0))

## [1.25.1](https://github.com/resourge/fetch/compare/v1.25.0...v1.25.1) (2024-01-18)


### Bug Fixes

* **transformurlsearchparams:** fix convertParamsToQueryString including undefined or null ([e8b03d7](https://github.com/resourge/fetch/commit/e8b03d7d129ce152eeb7f4dd80ec6fce7c0fe402))

# [1.25.0](https://github.com/resourge/fetch/compare/v1.24.0...v1.25.0) (2024-01-18)


### Features

* **add _convertparamstoquery set:** add _convertParamsToQuery setter ([7046416](https://github.com/resourge/fetch/commit/704641679be05e8d5be096e053126676ea70f449))

# [1.24.0](https://github.com/resourge/fetch/compare/v1.23.1...v1.24.0) (2023-11-03)


### Features

* **normalizeheaders:** make sure all method are uppercase to fix bug with patch method ([5eb1604](https://github.com/resourge/fetch/commit/5eb1604beb4d7cf59d93f958bee315af32e9b4fa))

## [1.23.1](https://github.com/resourge/fetch/compare/v1.23.0...v1.23.1) (2023-11-03)


### Bug Fixes

* **normalizeheaders:** fix request interceptor ([b4dff6b](https://github.com/resourge/fetch/commit/b4dff6bb59c7ba7386f2fe708202a3cc730cf64c))

# [1.23.0](https://github.com/resourge/fetch/compare/v1.22.0...v1.23.0) (2023-10-27)


### Features

* **httpresponse:** add config ([dd4a7d4](https://github.com/resourge/fetch/commit/dd4a7d4e6bb02054e1f996d2405d4a26d20ca49e))

# [1.22.0](https://github.com/resourge/fetch/compare/v1.21.3...v1.22.0) (2023-10-27)


### Features

* **httpservice:** make interceptors work async too ([90fc769](https://github.com/resourge/fetch/commit/90fc769625bd5edd43685cb78f2d25e226bb6127))

## [1.21.3](https://github.com/resourge/fetch/compare/v1.21.2...v1.21.3) (2023-10-27)


### Bug Fixes

* **http-service:** fix createURL regex not matching web url well ([efec75b](https://github.com/resourge/fetch/commit/efec75bb2a80e2cbee7345f38722441107df8a9e))
* **utils:** fix URL_PATTERN for localhost cases ([eca0cac](https://github.com/resourge/fetch/commit/eca0cac502169500fede790befdcf9075e906ea1))

## [1.21.2](https://github.com/resourge/fetch/compare/v1.21.1...v1.21.2) (2023-10-26)


### Bug Fixes

* **normalieheaders:** change normalizeHeaders location ([67a58ed](https://github.com/resourge/fetch/commit/67a58edf725d3752e3bf2369fceba41b839a12b9))

## [1.21.1](https://github.com/resourge/fetch/compare/v1.21.0...v1.21.1) (2023-10-26)


### Bug Fixes

* **normalizeheaders:** continue fix from previous commit ([ffb176a](https://github.com/resourge/fetch/commit/ffb176acd28042486c8e5c0c4d3954ff9d9774ee))

# [1.21.0](https://github.com/resourge/fetch/compare/v1.20.1...v1.21.0) (2023-10-26)


### Bug Fixes

* **basehttpservice:** fix BaseHttpService request when config has getter only ([ed35fe7](https://github.com/resourge/fetch/commit/ed35fe7ac397d678a1f7c07c5d1edb62a997b4db))


### Features

* **normalizebody:** normalize content-type to fix miss matchs ([e5e4b8e](https://github.com/resourge/fetch/commit/e5e4b8e66ad4d84d18cf1e532b921a6b042dba7d))

## [1.20.1](https://github.com/resourge/fetch/compare/v1.20.0...v1.20.1) (2023-10-09)


### Bug Fixes

* **interceptors:** fix headers type ([9952e28](https://github.com/resourge/fetch/commit/9952e285e03c378af31b1a1a4c08b5cab2e32585))
* **normalizeheaders:** remove putting all header into lowercase ([e428ec3](https://github.com/resourge/fetch/commit/e428ec3272f91b81c62164cd17ab929ff25c6e7f))

# [1.20.0](https://github.com/resourge/fetch/compare/v1.19.0...v1.20.0) (2023-10-09)


### Features

* **add loadingfallback and change loadingsuspense:** add suspense to loadingsuspense ([5acff9b](https://github.com/resourge/fetch/commit/5acff9bc855544bc2df16cc4345d8b7fc6e541b6))

# [1.19.0](https://github.com/resourge/fetch/compare/v1.18.0...v1.19.0) (2023-10-03)


### Features

* **loadingsuspense:** add LoadingSuspense component to show loader on suspense ([50ac02a](https://github.com/resourge/fetch/commit/50ac02a4a99d8477f358623ad5475b5829474287))

# [1.18.0](https://github.com/resourge/fetch/compare/v1.17.1...v1.18.0) (2023-10-03)


### Features

* **globalloader:** add backdropFilter ([898beb8](https://github.com/resourge/fetch/commit/898beb8a192d29bfd33b9aa56a50dfeb517c9dfb))

## [1.17.1](https://github.com/resourge/fetch/compare/v1.17.0...v1.17.1) (2023-10-02)


### Bug Fixes

* **usefetch:** fix useOnFocusFetch ([7d64b07](https://github.com/resourge/fetch/commit/7d64b07672f1579a2c49c1aa889b2119e2616989))

# [1.17.0](https://github.com/resourge/fetch/compare/v1.16.0...v1.17.0) (2023-09-27)


### Bug Fixes

* **basehttpservice:** make config optional ([c347182](https://github.com/resourge/fetch/commit/c347182d21e60694e6c8e9b38bf113b6daf58402))
* **usefetch:** simplify useFetch return syntax ([e5e8cda](https://github.com/resourge/fetch/commit/e5e8cda5f20fadbf840ddde9cf50776985281f9f))


### Features

* **globalloader:** change to portal instead of a simple component ([5eb6b38](https://github.com/resourge/fetch/commit/5eb6b3888ab5af119f6a8cd0cb5df23ff09f7eb7))

# [1.16.0](https://github.com/resourge/fetch/compare/v1.15.2...v1.16.0) (2023-09-27)


### Features

* **usefetchondependencyupdate:** add hook to add dependencies globaly ([8e91434](https://github.com/resourge/fetch/commit/8e91434fd8e9b5fb660ff091f477a91ba7b59cc5))

## [1.15.2](https://github.com/resourge/fetch/compare/v1.15.1...v1.15.2) (2023-09-06)


### Bug Fixes

* **useonscroll:** fix not working when scroll was in windows ([f5d52d0](https://github.com/resourge/fetch/commit/f5d52d060472e0b0dc5e29a5b1ba9b2057bb7a84))

## [1.15.1](https://github.com/resourge/fetch/compare/v1.15.0...v1.15.1) (2023-09-05)


### Bug Fixes

* **usefetch:** add actual funcionality ([d4b461c](https://github.com/resourge/fetch/commit/d4b461cc0080f40495e54cb2ded7d00147c01ed4))
* **usefetch:** add funcionality ([ad41304](https://github.com/resourge/fetch/commit/ad413047f7b16c410d56d230ca29d015cc26dbed))

# [1.15.0](https://github.com/resourge/fetch/compare/v1.14.2...v1.15.0) (2023-09-05)


### Features

* **usefetch:** add onDepsChange ([ff6859b](https://github.com/resourge/fetch/commit/ff6859b23360c095d6c2cf9b71de63fa51f56fc2))

## [1.14.2](https://github.com/resourge/fetch/compare/v1.14.1...v1.14.2) (2023-07-19)


### Bug Fixes

* **utils:** fix createUrl not working in some cases ([c0e4f93](https://github.com/resourge/fetch/commit/c0e4f9350e812b569354056628805d74cda91b84))

## [1.14.1](https://github.com/resourge/fetch/compare/v1.14.0...v1.14.1) (2023-07-19)


### Bug Fixes

* **utils:** fix createUrl not taking incount url starting with / ([a285808](https://github.com/resourge/fetch/commit/a285808de7102f36896e70dd6b107fd424052377))

# [1.14.0](https://github.com/resourge/fetch/compare/v1.13.2...v1.14.0) (2023-07-19)


### Bug Fixes

* **basehttpservice:** check if url is a full url before merging with baseUrl ([248319d](https://github.com/resourge/fetch/commit/248319d123d46f56a1dcc3ee8d3e7140c988a03c))
* **defaultconfig:** fix default config not updating ([75edc77](https://github.com/resourge/fetch/commit/75edc7718230ed11feda60ae161ff1c2f182c331))
* **errors:** add captureStackTrace ([eae8293](https://github.com/resourge/fetch/commit/eae82932deac839ff54b26188e7d57e6e98ae6ce))
* **normalizeheaders:** make sure all request headers are lowercase ([90f655e](https://github.com/resourge/fetch/commit/90f655e6a2cea5f0b91c1af1cca0ad298c56a794))
* **usefetch:** fix isLoading being always true even tho useFetch is not on Effect or EffectWithData ([788d76d](https://github.com/resourge/fetch/commit/788d76dca0294f9d3be86ac6b183f10ea6e80a1b))


### Features

* **errors:** error constructor is not part of the resulting stacktrace ([85af170](https://github.com/resourge/fetch/commit/85af170221ae13e046a9ab2c065e381a93945ccc))

## [1.13.2](https://github.com/resourge/fetch/compare/v1.13.1...v1.13.2) (2023-07-05)


### Bug Fixes

* **basehttpservice.ts:** added base url from basic requests ([5747315](https://github.com/resourge/fetch/commit/5747315e0d2fef991c5e6ba4e635ce239e0e4836))

## [1.13.1](https://github.com/resourge/fetch/compare/v1.13.0...v1.13.1) (2023-03-09)


### Bug Fixes

* **defaultconfig:** remove silent as default ([1f0461f](https://github.com/resourge/fetch/commit/1f0461f170e2181cd054853df598d0a771b3197e))

# [1.13.0](https://github.com/resourge/fetch/compare/v1.12.6...v1.13.0) (2023-03-08)


### Features

* **usefetch/http-service:** simplify syntaxe and automatically do abort request on unmount ([4b758f9](https://github.com/resourge/fetch/commit/4b758f9a512a50c02c8aeee100dfa56f3c445751))

## [1.12.6](https://github.com/resourge/fetch/compare/v1.12.5...v1.12.6) (2023-03-01)


### Bug Fixes

* **fetchprovider:** fix bug with hotreload ([2a81416](https://github.com/resourge/fetch/commit/2a81416f4bcb619ad4f4ca7bb3451622cd6d465a))

## [1.12.5](https://github.com/resourge/fetch/compare/v1.12.4...v1.12.5) (2023-02-20)


### Bug Fixes

* **usefetch:** fix interceptor not being accessible ([9959170](https://github.com/resourge/fetch/commit/99591703d096bd1f941f0b0c7995648a72e543c9))

## [1.12.4](https://github.com/resourge/fetch/compare/v1.12.3...v1.12.4) (2023-02-17)


### Bug Fixes

* **usefetch:** remove BaseHttpService from clone ([c23a8f0](https://github.com/resourge/fetch/commit/c23a8f03859eb718a8dfe4753b7eb8feb7834a9f))

## [1.12.3](https://github.com/resourge/fetch/compare/v1.12.2...v1.12.3) (2023-02-16)


### Bug Fixes

* **basehttpservice:** fix bug with HttpServiceInterface ([3c78e07](https://github.com/resourge/fetch/commit/3c78e07b12dda25c81e0a00513bffae970826492))

## [1.12.2](https://github.com/resourge/fetch/compare/v1.12.1...v1.12.2) (2023-02-16)


### Bug Fixes

* **package.json:** remove unecessary dependency ([8c5c77a](https://github.com/resourge/fetch/commit/8c5c77ab069221411be8842384eb446ce9e58ccc))

## [1.12.1](https://github.com/resourge/fetch/compare/v1.12.0...v1.12.1) (2023-02-16)


### Bug Fixes

* **fetchcontext:** fix an type needing generic type ([6da5db5](https://github.com/resourge/fetch/commit/6da5db542fdff42237844dd8243f67843085f32b))

# [1.12.0](https://github.com/resourge/fetch/compare/v1.11.1...v1.12.0) (2023-02-16)


### Bug Fixes

* **httpservice:** fix type ([2c79cf7](https://github.com/resourge/fetch/commit/2c79cf721d20affa3f3bae93d337b264b8db0702))
* **loadingservice:** fix findIndex not working as intended ([cc04ca2](https://github.com/resourge/fetch/commit/cc04ca2f575fa5d9fa3a74f50ba6ecdfc5aedace))
* **readme:** react-fetch documentation ([921a7dc](https://github.com/resourge/fetch/commit/921a7dc027d4841724faeb43c12251e56a746080))


### Features

* **react-fetch:** improve httpclassservice support ([c4f095a](https://github.com/resourge/fetch/commit/c4f095ae7ae58bb18f3f7bcbe9c9c964b591cb20))
* **usefetch:** change option name to better match it's use ([57b541f](https://github.com/resourge/fetch/commit/57b541f7d957363b5a8a1dc3a7d6057762eff85b))

## [1.11.1](https://github.com/resourge/fetch/compare/v1.11.0...v1.11.1) (2023-01-19)


### Bug Fixes

* **usefetch:** fix shouldTriggerFetch not being true by default ([426aaae](https://github.com/resourge/fetch/commit/426aaae7fcd0fcd88986acb0b090e441b6b62614))

# [1.11.0](https://github.com/resourge/fetch/compare/v1.10.1...v1.11.0) (2023-01-19)


### Features

* **useform:** add shouldTriggerFetch to make possible request not being called at component mount ([a19f8f8](https://github.com/resourge/fetch/commit/a19f8f81793cdfaaffd376a9f336938a0ff11198))

## [1.10.1](https://github.com/resourge/fetch/compare/v1.10.0...v1.10.1) (2023-01-16)


### Bug Fixes

* **for nextjs:** remove the use of window object without validation first to prefent nextjs error ([81fd6bb](https://github.com/resourge/fetch/commit/81fd6bb9fcd2958dc0fe7041ef92e7bcd7e10028))

# [1.10.0](https://github.com/resourge/fetch/compare/v1.9.0...v1.10.0) (2022-12-15)


### Features

* **httpservice:** reduce threshold from 3500 to 2750 ([6335e2a](https://github.com/resourge/fetch/commit/6335e2aece55fb0d1a60e248ee36547d4c3bef68))

# [1.9.0](https://github.com/resourge/fetch/compare/v1.8.15...v1.9.0) (2022-11-28)


### Features

* **throttlepromise:** when threshold is 0 make it 500 to prevent repeating requests ([af11141](https://github.com/resourge/fetch/commit/af11141f66dd906a06b2063efeb6e39cc0685b7e))

## [1.8.15](https://github.com/resourge/fetch/compare/v1.8.14...v1.8.15) (2022-11-24)


### Bug Fixes

* **httpservice:** fix onResponseError Data being txt instead of JSON in content-type json ([522414c](https://github.com/resourge/fetch/commit/522414ca701d850ceaf6f5be5855c2f862eb94a3))

## [1.8.14](https://github.com/resourge/fetch/compare/v1.8.13...v1.8.14) (2022-11-24)


### Bug Fixes

* **usescrollrestoration:** change scroll behavior to auto ([21c92f6](https://github.com/resourge/fetch/commit/21c92f644b8af6951d5e4f42f310b2ae1ad96d7e))

## [1.8.13](https://github.com/resourge/fetch/compare/v1.8.12...v1.8.13) (2022-11-22)


### Bug Fixes

* **usefetch:** add null to FetchError ([8a612e9](https://github.com/resourge/fetch/commit/8a612e922cc8967414f236cde252aae88c963020))

## [1.8.12](https://github.com/resourge/fetch/compare/v1.8.11...v1.8.12) (2022-11-22)


### Bug Fixes

* **hooks/index.ts:** include UseFetchStateConfig on export ([cca5dee](https://github.com/resourge/fetch/commit/cca5deeb563d8bf323304755f0aca898d15be846))

## [1.8.11](https://github.com/resourge/fetch/compare/v1.8.10...v1.8.11) (2022-11-22)


### Bug Fixes

* **usefetch:** fix type for useFetch in useEffect mode ([1e22cfe](https://github.com/resourge/fetch/commit/1e22cfe25694040b3c26a90d58a063ba4d0ee3a8))

## [1.8.10](https://github.com/resourge/fetch/compare/v1.8.9...v1.8.10) (2022-11-21)


### Bug Fixes

* **fetchprovider:** change baseUrl even if not fetchService exists ([de1f9d4](https://github.com/resourge/fetch/commit/de1f9d428c036f2a022090e7fd994bbbf5ae80f0))
* **httpservice:** add baseUrl to clone method ([bc9b2e5](https://github.com/resourge/fetch/commit/bc9b2e54deb415969c98bb6893174723b2acbcc1))

## [1.8.9](https://github.com/resourge/fetch/compare/v1.8.8...v1.8.9) (2022-11-21)


### Bug Fixes

* **fetchprovider:** remove error catch when using multiple FetchProviders ([f70bbf9](https://github.com/resourge/fetch/commit/f70bbf9922466b85bb27dee9ea9896b1d8f3ee6a))
* **usefetch:** fix useFetch HttpService clone ([e012ff3](https://github.com/resourge/fetch/commit/e012ff304d26c034b910d8ce0873a755270e774b))

## [1.8.8](https://github.com/resourge/fetch/compare/v1.8.7...v1.8.8) (2022-11-21)


### Bug Fixes

* **fetchcontext:** add httpService to context ([fcc931b](https://github.com/resourge/fetch/commit/fcc931b8ab4fc860976a8ec57d51cc7462ab3d22))

## [1.8.7](https://github.com/resourge/fetch/compare/v1.8.6...v1.8.7) (2022-11-18)


### Bug Fixes

* **usefetch:** fix wrong type ([56a88de](https://github.com/resourge/fetch/commit/56a88de066c2fc741728c6b665f39c9b02e2561b))

## [1.8.6](https://github.com/resourge/fetch/compare/v1.8.5...v1.8.6) (2022-11-18)


### Bug Fixes

* **interceptors:** change Interceptor order on useFetch ([572a48e](https://github.com/resourge/fetch/commit/572a48e4037cbd4c9d7bd5f0c6a5701be5ad9d07))

## [1.8.5](https://github.com/resourge/fetch/compare/v1.8.4...v1.8.5) (2022-11-18)


### Bug Fixes

* **usefetch:** fix type not working as intended ([9f37d93](https://github.com/resourge/fetch/commit/9f37d937b8c01cd034f06d91ef23e070ec75a0c1))

## [1.8.4](https://github.com/resourge/fetch/compare/v1.8.3...v1.8.4) (2022-11-18)


### Bug Fixes

* **usefetch:** make Http match HttpService type ([e21ea13](https://github.com/resourge/fetch/commit/e21ea13c8009a94e8b9379c9554cb8e8ceecd8b4))

## [1.8.3](https://github.com/resourge/fetch/compare/v1.8.2...v1.8.3) (2022-11-18)


### Bug Fixes

* **usefetch:** fix useFetchEffect type ([1c5eaec](https://github.com/resourge/fetch/commit/1c5eaec082f60f6871674287c92b90b71bdfd385))

## [1.8.2](https://github.com/resourge/fetch/compare/v1.8.1...v1.8.2) (2022-11-18)


### Bug Fixes

* **http-service:** fix types not having banner ([31befea](https://github.com/resourge/fetch/commit/31befea4bc9959c3fab1b3e13c415496ae17674a))

## [1.8.1](https://github.com/resourge/fetch/compare/v1.8.0...v1.8.1) (2022-11-18)


### Bug Fixes

* **react-fetch:** fix http-service version ([4d99a98](https://github.com/resourge/fetch/commit/4d99a980c4fcd79ddc10d8f86bb295fdf820a293))

# [1.8.0](https://github.com/resourge/fetch/compare/v1.7.2...v1.8.0) (2022-11-18)


### Features

* **usefetch:** simplify usefetch ([6146473](https://github.com/resourge/fetch/commit/614647305c315712981e3ba242e4e04752b18c86))

## [1.7.2](https://github.com/resourge/fetch/compare/v1.7.1...v1.7.2) (2022-11-16)


### Bug Fixes

* **fetchprovider:** change from useEffect to useLayoutEffect to make sure new HttpService is done ([8012ea9](https://github.com/resourge/fetch/commit/8012ea90e7092171e5e7ab2b11c3d754f7078cff))

## [1.7.1](https://github.com/resourge/fetch/compare/v1.7.0...v1.7.1) (2022-11-15)


### Bug Fixes

* **httpservice:** fix upload not working as intended ([b96e897](https://github.com/resourge/fetch/commit/b96e8973accaa79025acce4bb57e0647743a7ab3))

# [1.7.0](https://github.com/resourge/fetch/compare/v1.6.0...v1.7.0) (2022-11-15)


### Features

* **usefetch/usefetchcallback:** add noEmitError to not trigger an state update on error ([7668907](https://github.com/resourge/fetch/commit/76689072fb4a3e404bbd0ae5d5cc7a12699a526d))

# [1.6.0](https://github.com/resourge/fetch/compare/v1.5.8...v1.6.0) (2022-11-15)


### Features

* **httpservice:** add ways to change some default configs ([aeef579](https://github.com/resourge/fetch/commit/aeef57985f55d59a459d96017c950b180f3507ea))

## [1.5.8](https://github.com/resourge/fetch/compare/v1.5.7...v1.5.8) (2022-11-15)


### Bug Fixes

* **throttlepromise:** fix timestamp not being updated after creation ([bd35873](https://github.com/resourge/fetch/commit/bd35873c5ab4c71d7b84e96f7200206956ff70f1))

## [1.5.7](https://github.com/resourge/fetch/compare/v1.5.6...v1.5.7) (2022-11-15)


### Bug Fixes

* **throttlepromise:** fix throttleTimestamp being removed after request is done ([30b7de4](https://github.com/resourge/fetch/commit/30b7de4de55b9d55382c31e844fd245aa5316e55))

## [1.5.6](https://github.com/resourge/fetch/compare/v1.5.5...v1.5.6) (2022-11-14)


### Bug Fixes

* **useonfocus.native:** make previous fix also work on native ([6d85240](https://github.com/resourge/fetch/commit/6d852406e2c6e913a3d347b82b9d72855ec1e205))

## [1.5.5](https://github.com/resourge/fetch/compare/v1.5.4...v1.5.5) (2022-11-14)


### Bug Fixes

* **throttlemethod:** clear method when component is cleared ([ab9e072](https://github.com/resourge/fetch/commit/ab9e0721c0d946324054d05df8f915f36beeb1de))

## [1.5.4](https://github.com/resourge/fetch/compare/v1.5.3...v1.5.4) (2022-11-11)


### Bug Fixes

* **httpservice:** fix types ([68cf2d1](https://github.com/resourge/fetch/commit/68cf2d18c31fe908f6599b918d0963fc36b386c9))

## [1.5.3](https://github.com/resourge/fetch/compare/v1.5.2...v1.5.3) (2022-11-11)


### Bug Fixes

* **httpservice:** improve request handling ([caa0308](https://github.com/resourge/fetch/commit/caa0308c1a6623246224d845cb4c341307d08263))

## [1.5.2](https://github.com/resourge/fetch/compare/v1.5.1...v1.5.2) (2022-11-11)


### Bug Fixes

* **httpservice:** simplify response process and httpResponseError for fetch errors ([00dcf0c](https://github.com/resourge/fetch/commit/00dcf0c29a5805ee652aa323759663963b0e66a4))

## [1.5.1](https://github.com/resourge/fetch/compare/v1.5.0...v1.5.1) (2022-11-11)


### Bug Fixes

* **httpservice:** fix small bugs ([264dea7](https://github.com/resourge/fetch/commit/264dea7fa18aa43fe19b2b1d478742f933cbec23))

# [1.5.0](https://github.com/resourge/fetch/compare/v1.4.0...v1.5.0) (2022-10-27)


### Features

* **usefetch:** usefetch add a way to manually set data ([ef1bc1c](https://github.com/resourge/fetch/commit/ef1bc1ce53a2c6ea485f7f719d7fbd78b63182f0))

# [1.4.0](https://github.com/resourge/fetch/compare/v1.3.0...v1.4.0) (2022-10-21)


### Features

* **loadingservice:** make setLoading not mandatory L ([202e196](https://github.com/resourge/fetch/commit/202e1967bf67501d7f9852c0feb05e119f966791))

# [1.3.0](https://github.com/resourge/fetch/compare/v1.2.4...v1.3.0) (2022-10-14)


### Features

* **useonfocusfetch:** change refresh on focus to 10minutes ([7dd360f](https://github.com/resourge/fetch/commit/7dd360ff4b718119e54be8d5e3b15c6ddff4cb29))

## [1.2.4](https://github.com/resourge/fetch/compare/v1.2.3...v1.2.4) (2022-10-14)


### Bug Fixes

* **loadingservice:** fix loadingservice not working as intended ([1b9829c](https://github.com/resourge/fetch/commit/1b9829c16534e515487220dfc57d8eaf5445fef5))

## [1.2.3](https://github.com/resourge/fetch/compare/v1.2.2...v1.2.3) (2022-10-14)


### Bug Fixes

* **notificationservice:** add if in case notify doesnt exist ([9d8dacd](https://github.com/resourge/fetch/commit/9d8dacde8c12f398504937f2422192a75c799d03))

## [1.2.2](https://github.com/resourge/fetch/compare/v1.2.1...v1.2.2) (2022-10-13)


### Bug Fixes

* **usefetchcallback:** fix typo ([2173eb0](https://github.com/resourge/fetch/commit/2173eb0c066e41376428678b11989bcf344a869b))

## [1.2.1](https://github.com/resourge/fetch/compare/v1.2.0...v1.2.1) (2022-10-13)


### Bug Fixes

* **usefetch:** fix useFetch return fetch type ([9a11cce](https://github.com/resourge/fetch/commit/9a11cce07db426ed4dde255b36ce25221453ff49))

# [1.2.0](https://github.com/resourge/fetch/compare/v1.1.0...v1.2.0) (2022-10-13)


### Features

* **usecontrolledfetch:** add abort optional to useFetchCallback ([17265d7](https://github.com/resourge/fetch/commit/17265d79823f8ad77ab7ec32b9e85352d065265f))

# [1.1.0](https://github.com/resourge/fetch/compare/v1.0.7...v1.1.0) (2022-10-13)


### Features

* **usefetchcallback:** change useFetchcallback to also do loading ([8917806](https://github.com/resourge/fetch/commit/89178064a4327b751203a63216bd2e94bcf51dc7))

## [1.0.7](https://github.com/resourge/fetch/compare/v1.0.6...v1.0.7) (2022-10-12)


### Bug Fixes

* **globalloader:** fix globalLoading ([587f82e](https://github.com/resourge/fetch/commit/587f82eb1f3222ea8f1f6d5d00f44c3ccd106049))

## [1.0.6](https://github.com/resourge/fetch/compare/v1.0.5...v1.0.6) (2022-10-11)


### Bug Fixes

* **usefetch:** fix onError when returning undefined was not working as intended ([397c4f4](https://github.com/resourge/fetch/commit/397c4f41bff450cd9d7bd469d410866d3a17050f))

## [1.0.5](https://github.com/resourge/fetch/compare/v1.0.4...v1.0.5) (2022-10-11)


### Bug Fixes

* **react-fetch:** separete http-service to external package ([fd4b4b6](https://github.com/resourge/fetch/commit/fd4b4b650768a78200b8e53025d7ee206fe93a27))

## [1.0.4](https://github.com/resourge/fetch/compare/v1.0.3...v1.0.4) (2022-10-10)


### Bug Fixes

* **rollup.config:** fix building ([b92207b](https://github.com/resourge/fetch/commit/b92207bd31ece81b65b08f712b809c59d5cf467b))

## [1.0.3](https://github.com/resourge/fetch/compare/v1.0.2...v1.0.3) (2022-10-10)


### Bug Fixes

* **mergetypes:** fix index.d.ts removing necessary types ([9c903b9](https://github.com/resourge/fetch/commit/9c903b9cbffa3bb0856abcdbb27fbfe4ba08d209))

## [1.0.2](https://github.com/resourge/fetch/compare/v1.0.1...v1.0.2) (2022-10-10)


### Bug Fixes

* **scripts/mergetypes:** switch from merge-dirs to recursive-copy ([fa2edb5](https://github.com/resourge/fetch/commit/fa2edb5b0dac1de9fd6276f3b4f2689a649a4393))

## [1.0.1](https://github.com/resourge/fetch/compare/v1.0.0...v1.0.1) (2022-10-10)


### Bug Fixes

* **scripts:** fix scripts error ([a5ffc81](https://github.com/resourge/fetch/commit/a5ffc81d767b12205b3c90d063c34f231336baa2))

# 1.0.0 (2022-10-07)


### Features

* **package:** first release ([dd7528b](https://github.com/resourge/fetch/commit/dd7528bb7f6878ee250a8ed796382e1d521a77d3))
