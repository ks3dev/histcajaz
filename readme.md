An empty "well structured" mvc4 app with some libraries blended in. Maguma is just a name for the solution.

Libraries/frameworks being added:

- [history.js]( https://github.com/balupton/History.js/ )
 - It just needs to know which are the important DIVs in the MVC 4 template app
- [Cassette]( https://github.com/andrewdavey/cassette )
  - Just needs to know the locations of the bundles
  - In code just reference the bundles, and then render them
- [Jasmine linked to Cassette]( https://github.com/pivotal/jasmine )
  - Simply needs to know where jasmine spec files are
  - Then navigate to localhost:PORT/_cassette/jasmine/Private/specs/try1 (this is the basic example)
- [File Uploader]( https://github.com/NickJosevski/file-uploader ) is also included in another branch.
   - It has it's full test suite in a cassette-jasmine bundle
