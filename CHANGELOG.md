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
