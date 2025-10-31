"use client";

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
        Поддержка WayX
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl p-6 space-y-4">
        <details className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <summary className="cursor-pointer font-medium text-lg text-gray-800 dark:text-gray-200">
            🚚 Как оформить новую заявку?
          </summary>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Перейдите на страницу "Новая заявка", заполните форму и нажмите
            “Отправить”.   рассчитает оптимальный маршрут и стоимость.
          </p>
        </details>

        <details className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <summary className="cursor-pointer font-medium text-lg text-gray-800 dark:text-gray-200">
            💰 Как рассчитывается цена?
          </summary>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Стоимость зависит от типа транспорта, расстояния и веса груза.
            Алгоритм   учитывает реальные рыночные данные.
          </p>
        </details>

        <details>
          <summary className="cursor-pointer font-medium text-lg text-gray-800 dark:text-gray-200">
            📞 Как связаться с WayX?
          </summary>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Email: support@wayx.kz  
            Телефон: +7 (700) 000-00-00
          </p>
        </details>
      </div>
    </div>
  );
}
