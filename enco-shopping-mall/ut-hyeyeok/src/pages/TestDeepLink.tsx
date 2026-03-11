export default function TestDeepLink() {
  const openApp = () => {
    window.location.href = "enco://app/pay";
  };

  return (
    <div>
      <button onClick={openApp}>
        앱 열기 테스트
      </button>
    </div>
  );
}